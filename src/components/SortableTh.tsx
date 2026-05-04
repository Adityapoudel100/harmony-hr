import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortState } from "@/hooks/use-sortable";

interface Props<K extends string> {
  label: React.ReactNode;
  sortKey: K;
  sort: SortState<K>;
  onToggle: (key: K) => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onToggle,
  align = "left",
  className,
}: Props<K>) {
  const active = sort.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th className={cn("select-none", className)}>
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          align === "center" && "justify-center w-full",
          align === "right" && "justify-end w-full",
          active && "text-foreground",
        )}
      >
        <span>{label}</span>
        <Icon className={cn("w-3 h-3 shrink-0", active ? "text-primary" : "text-muted-foreground/60")} />
      </button>
    </th>
  );
}
