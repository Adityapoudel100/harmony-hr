import { useState, useMemo } from "react";

export type SortDir = "asc" | "desc";
export interface SortState<K extends string> {
  key: K | null;
  dir: SortDir;
}

/**
 * Generic sortable hook for tables.
 * Handles strings, numbers, dates, and "h Xm" duration strings.
 */
export function useSortable<T, K extends string>(
  rows: T[],
  initial: SortState<K> = { key: null, dir: "asc" },
  accessor?: (row: T, key: K) => unknown,
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const toggle = (key: K) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const key = sort.key;
    const get = accessor ?? ((r: T, k: K) => (r as Record<string, unknown>)[k]);
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = get(a, key);
      const vb = get(b, key);
      const cmp = compare(va, vb);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort, accessor]);

  return { sorted, sort, toggle };
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const na = toNumber(a);
  const nb = toNumber(b);
  if (na !== null && nb !== null) return na - nb;

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && !isNaN(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s || s === "—") return null;
    // ISO date
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const t = Date.parse(s);
      if (!isNaN(t)) return t;
    }
    // Duration "9h 08m" / "8h" / "0h 30m"
    const dur = s.match(/^(\d+)h(?:\s*(\d+)m)?$/);
    if (dur) return Number(dur[1]) * 60 + (dur[2] ? Number(dur[2]) : 0);
    // Currency / numeric with separators
    const cleaned = s.replace(/[, ]/g, "").replace(/^[A-Za-z₹$€£¥]+/, "");
    const n = Number(cleaned);
    if (!isNaN(n) && cleaned !== "") return n;
  }
  return null;
}
