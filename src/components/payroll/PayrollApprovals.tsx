import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Lock, Send, ClipboardCheck, AlertCircle, FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { fmt, NEPALI_MONTHS } from "@/lib/payroll-engine";
import { logAudit } from "@/lib/payroll-audit";

export type RunStatus = "draft" | "hr_approved" | "finance_approved" | "locked";

export interface PayrollRun {
  id: string;
  month: string;
  year: string;
  employeeCount: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  status: RunStatus;
  createdAt: string;
  hrApprovedAt?: string;
  hrApprovedBy?: string;
  financeApprovedAt?: string;
  financeApprovedBy?: string;
  lockedAt?: string;
  notes?: string;
}

const KEY = "cubit.payroll.runs.v1";

export function getPayrollRuns(): PayrollRun[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function savePayrollRuns(runs: PayrollRun[]) {
  localStorage.setItem(KEY, JSON.stringify(runs));
}

const statusBadge: Record<RunStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  hr_approved: "bg-primary/10 text-primary",
  finance_approved: "bg-orange-500/10 text-orange-600",
  locked: "bg-success/10 text-success",
};

const statusLabel: Record<RunStatus, string> = {
  draft: "Draft",
  hr_approved: "HR Approved",
  finance_approved: "Finance Approved",
  locked: "Locked",
};

export default function PayrollApprovals() {
  const { toast } = useToast();
  const { role } = useRole();
  const [runs, setRuns] = useState<PayrollRun[]>(() => getPayrollRuns());
  const [filter, setFilter] = useState<"all" | RunStatus>("all");

  // Manual draft creator (so user can demo workflow)
  const [newMonth, setNewMonth] = useState(NEPALI_MONTHS[6]);
  const [newYear, setNewYear] = useState(String(new Date().getFullYear() - 1943));

  useEffect(() => { savePayrollRuns(runs); }, [runs]);

  const filtered = useMemo(
    () => runs.filter(r => filter === "all" || r.status === filter)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [runs, filter]
  );

  const stats = useMemo(() => ({
    drafts: runs.filter(r => r.status === "draft").length,
    pending: runs.filter(r => r.status === "hr_approved").length,
    locked: runs.filter(r => r.status === "locked").length,
  }), [runs]);

  const advance = (id: string, next: RunStatus) => {
    setRuns(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated: PayrollRun = { ...r, status: next };
      const stamp = new Date().toISOString();
      if (next === "hr_approved") { updated.hrApprovedAt = stamp; updated.hrApprovedBy = role; }
      if (next === "finance_approved") { updated.financeApprovedAt = stamp; updated.financeApprovedBy = role; }
      if (next === "locked") { updated.lockedAt = stamp; }
      logAudit({
        action: `payroll.${next}`,
        entity: `${r.month} ${r.year}`,
        detail: `${r.employeeCount} employees · Net NPR ${fmt(r.totalNet)}`,
      });
      return updated;
    }));
    toast({ title: `Moved to ${statusLabel[next]}` });
  };

  const createDraft = () => {
    const draft: PayrollRun = {
      id: crypto.randomUUID(),
      month: newMonth,
      year: newYear,
      employeeCount: 0,
      totalGross: 0,
      totalTax: 0,
      totalNet: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    setRuns(prev => [draft, ...prev]);
    logAudit({ action: "payroll.draft.create", entity: `${newMonth} ${newYear}`, detail: "Manual draft created" });
    toast({ title: "Draft created" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Drafts", value: String(stats.drafts), icon: FileSignature, color: "text-muted-foreground" },
          { label: "Pending Finance", value: String(stats.pending), icon: AlertCircle, color: "text-orange-500" },
          { label: "Locked Runs", value: String(stats.locked), icon: Lock, color: "text-success" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}</span></div>
            <p className={`text-xl font-semibold font-mono-data ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Month</label>
            <Select value={newMonth} onValueChange={setNewMonth}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{NEPALI_MONTHS.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Year</label>
            <Input value={newYear} onChange={e => setNewYear(e.target.value)} className="h-8 text-xs w-24 font-mono-data" />
          </div>
          <Button size="sm" className="h-8 gap-1 text-xs" onClick={createDraft}>
            <FileSignature className="w-3.5 h-3.5" />Create Draft Run
          </Button>
          <div className="ml-auto">
            <Select value={filter} onValueChange={v => setFilter(v as any)}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                <SelectItem value="hr_approved" className="text-xs">HR Approved</SelectItem>
                <SelectItem value="finance_approved" className="text-xs">Finance Approved</SelectItem>
                <SelectItem value="locked" className="text-xs">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Workflow: Draft → HR Approval → Finance Approval → Locked. Locked runs cannot be edited.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payroll runs in this view</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="nexus-table" style={{ minWidth: "1100px" }}>
              <thead>
                <tr>
                  <th>Period</th><th>Status</th><th>Employees</th><th>Gross</th><th>Tax</th><th>Net</th>
                  <th>HR</th><th>Finance</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="text-xs font-medium">{r.month} {r.year}</td>
                    <td><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}>{statusLabel[r.status]}</span></td>
                    <td className="text-xs font-mono-data">{r.employeeCount}</td>
                    <td className="text-xs font-mono-data">{fmt(r.totalGross)}</td>
                    <td className="text-xs font-mono-data text-destructive">{fmt(r.totalTax)}</td>
                    <td className="text-xs font-mono-data font-semibold text-success">{fmt(r.totalNet)}</td>
                    <td className="text-[10px] text-muted-foreground font-mono-data">{r.hrApprovedAt ? new Date(r.hrApprovedAt).toLocaleDateString() : "—"}</td>
                    <td className="text-[10px] text-muted-foreground font-mono-data">{r.financeApprovedAt ? new Date(r.financeApprovedAt).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="flex gap-1">
                        {r.status === "draft" && (
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => advance(r.id, "hr_approved")}>
                            <Send className="w-3 h-3" />HR Approve
                          </Button>
                        )}
                        {r.status === "hr_approved" && (
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => advance(r.id, "finance_approved")}>
                            <CheckCircle2 className="w-3 h-3" />Finance OK
                          </Button>
                        )}
                        {r.status === "finance_approved" && (
                          <Button size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => advance(r.id, "locked")}>
                            <Lock className="w-3 h-3" />Lock
                          </Button>
                        )}
                        {r.status === "locked" && (
                          <span className="text-[10px] text-success font-mono-data">Finalized</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper used by payroll page when "Save Month" runs, to upsert a draft
export function upsertDraftRun(input: { month: string; year: string; employeeCount: number; totalGross: number; totalTax: number; totalNet: number; }) {
  const all = getPayrollRuns();
  const existingIdx = all.findIndex(r => r.month === input.month && r.year === input.year && r.status !== "locked");
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...input };
  } else {
    all.unshift({
      id: crypto.randomUUID(),
      ...input,
      status: "draft",
      createdAt: new Date().toISOString(),
    });
  }
  savePayrollRuns(all);
  logAudit({ action: "payroll.save", entity: `${input.month} ${input.year}`, detail: `${input.employeeCount} employees · Net NPR ${fmt(input.totalNet)}` });
}
