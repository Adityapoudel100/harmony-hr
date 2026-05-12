// Lightweight client-side audit log for payroll actions

export interface AuditEntry {
  id: string;
  action: string;        // e.g. "loan.create", "payroll.approve.hr"
  entity: string;        // employee name, payroll period, formula id...
  detail: string;        // human readable detail
  actor: string;         // role / user
  timestamp: string;     // ISO
}

const KEY = "cubit.payroll.audit.v1";
const MAX_ENTRIES = 500;

export function getAuditLog(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function logAudit(input: { action: string; entity: string; detail: string; actor?: string }): void {
  const list = getAuditLog();
  const actor = input.actor ?? (localStorage.getItem("cubit-role") || "system");
  list.unshift({
    id: crypto.randomUUID(),
    action: input.action,
    entity: input.entity,
    detail: input.detail,
    actor,
    timestamp: new Date().toISOString(),
  });
  if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearAuditLog(): void {
  localStorage.removeItem(KEY);
}
