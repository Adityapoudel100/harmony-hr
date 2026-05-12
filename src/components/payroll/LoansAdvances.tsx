import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Wallet, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/payroll-engine";
import { logAudit } from "@/lib/payroll-audit";

export type LoanType = "loan" | "advance";
export type LoanStatus = "active" | "closed";

export interface LoanRecord {
  id: string;
  empName: string;
  type: LoanType;
  principal: number;
  emi: number;
  paidInstallments: number;
  totalInstallments: number;
  startMonth: string; // e.g. "Shrawan 2082"
  reason: string;
  status: LoanStatus;
  createdAt: string;
}

const STORAGE_KEY = "cubit.payroll.loans.v1";

const blank = (): LoanRecord => ({
  id: crypto.randomUUID(),
  empName: "",
  type: "loan",
  principal: 0,
  emi: 0,
  paidInstallments: 0,
  totalInstallments: 1,
  startMonth: "",
  reason: "",
  status: "active",
  createdAt: new Date().toISOString(),
});

export function getActiveDeductionFor(empName: string): { loan: number; advance: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { loan: 0, advance: 0 };
    const list: LoanRecord[] = JSON.parse(raw);
    return list
      .filter(l => l.empName === empName && l.status === "active" && l.paidInstallments < l.totalInstallments)
      .reduce((acc, l) => {
        if (l.type === "loan") acc.loan += l.emi;
        else acc.advance += l.emi;
        return acc;
      }, { loan: 0, advance: 0 });
  } catch { return { loan: 0, advance: 0 }; }
}

export default function LoansAdvances() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<LoanRecord>(blank());
  const [filterType, setFilterType] = useState<"all" | LoanType>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }, [loans]);

  const filtered = useMemo(
    () => loans.filter(l => filterType === "all" || l.type === filterType),
    [loans, filterType]
  );

  const totals = useMemo(() => {
    const active = loans.filter(l => l.status === "active");
    return {
      activeCount: active.length,
      monthlyDeduction: active.reduce((a, l) => a + l.emi, 0),
      outstanding: active.reduce((a, l) => a + (l.emi * (l.totalInstallments - l.paidInstallments)), 0),
    };
  }, [loans]);

  const handleSave = () => {
    if (!draft.empName.trim() || !draft.principal || !draft.emi || !draft.totalInstallments) {
      toast({ title: "Missing fields", description: "Employee, principal, EMI and tenure required", variant: "destructive" });
      return;
    }
    setLoans(prev => [...prev, draft]);
    logAudit({ action: "loan.create", entity: draft.empName, detail: `${draft.type} NPR ${fmt(draft.principal)} · EMI ${fmt(draft.emi)} × ${draft.totalInstallments}` });
    setDraft(blank());
    setDialogOpen(false);
    toast({ title: "Loan added" });
  };

  const recordPayment = (id: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id !== id) return l;
      const paid = Math.min(l.totalInstallments, l.paidInstallments + 1);
      const status: LoanStatus = paid >= l.totalInstallments ? "closed" : "active";
      logAudit({ action: "loan.installment", entity: l.empName, detail: `${l.type} EMI #${paid}/${l.totalInstallments} (NPR ${fmt(l.emi)})` });
      return { ...l, paidInstallments: paid, status };
    }));
  };

  const remove = (id: string) => {
    const l = loans.find(x => x.id === id);
    setLoans(prev => prev.filter(l => l.id !== id));
    if (l) logAudit({ action: "loan.delete", entity: l.empName, detail: `${l.type} NPR ${fmt(l.principal)}` });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Records", value: String(totals.activeCount), icon: Wallet, color: "text-primary" },
          { label: "Monthly Deduction", value: `NPR ${fmt(totals.monthlyDeduction)}`, icon: TrendingDown, color: "text-destructive" },
          { label: "Outstanding", value: `NPR ${fmt(totals.outstanding)}`, icon: AlertCircle, color: "text-orange-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}</span></div>
            <p className={`text-xl font-semibold font-mono-data ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold">Loans & Advance Salary</h3>
            <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
              <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                <SelectItem value="loan" className="text-xs">Loans</SelectItem>
                <SelectItem value="advance" className="text-xs">Advances</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 text-xs h-7"><Plus className="w-3 h-3" />New Loan / Advance</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New Loan / Advance Salary</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Employee Name</label>
                    <Input value={draft.empName} onChange={e => setDraft({ ...draft, empName: e.target.value })} className="h-8 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <Select value={draft.type} onValueChange={v => setDraft({ ...draft, type: v as LoanType })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loan" className="text-xs">Loan</SelectItem>
                        <SelectItem value="advance" className="text-xs">Advance Salary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start Month</label>
                    <Input value={draft.startMonth} onChange={e => setDraft({ ...draft, startMonth: e.target.value })} className="h-8 text-xs" placeholder="Shrawan 2082" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Principal (NPR)</label>
                    <Input type="number" value={draft.principal || ""} onChange={e => setDraft({ ...draft, principal: +e.target.value })} className="h-8 text-xs font-mono-data" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">EMI (NPR/month)</label>
                    <Input type="number" value={draft.emi || ""} onChange={e => setDraft({ ...draft, emi: +e.target.value })} className="h-8 text-xs font-mono-data" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Tenure (installments)</label>
                    <Input type="number" min={1} value={draft.totalInstallments} onChange={e => setDraft({ ...draft, totalInstallments: +e.target.value })} className="h-8 text-xs font-mono-data" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Reason</label>
                    <Input value={draft.reason} onChange={e => setDraft({ ...draft, reason: e.target.value })} className="h-8 text-xs" placeholder="e.g. Medical, Education" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No loan or advance records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="nexus-table" style={{ minWidth: "1100px" }}>
              <thead>
                <tr>
                  <th>Employee</th><th>Type</th><th>Start</th><th>Principal</th><th>EMI</th>
                  <th>Progress</th><th>Outstanding</th><th>Status</th><th>Reason</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const remaining = (l.totalInstallments - l.paidInstallments) * l.emi;
                  const pct = l.totalInstallments ? (l.paidInstallments / l.totalInstallments) * 100 : 0;
                  return (
                    <tr key={l.id}>
                      <td className="text-xs font-medium">{l.empName}</td>
                      <td><span className={`text-[10px] px-2 py-0.5 rounded-full ${l.type === "loan" ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-600"}`}>{l.type === "loan" ? "Loan" : "Advance"}</span></td>
                      <td className="text-xs font-mono-data text-muted-foreground">{l.startMonth || "—"}</td>
                      <td className="text-xs font-mono-data">{fmt(l.principal)}</td>
                      <td className="text-xs font-mono-data text-destructive">{fmt(l.emi)}</td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono-data text-muted-foreground">{l.paidInstallments}/{l.totalInstallments}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono-data">{fmt(remaining)}</td>
                      <td>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-xs text-muted-foreground max-w-[160px] truncate">{l.reason || "—"}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          {l.status === "active" && (
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] gap-1" onClick={() => recordPayment(l.id)}>
                              <CheckCircle2 className="w-3 h-3" />Pay EMI
                            </Button>
                          )}
                          <button onClick={() => remove(l.id)} className="p-1 rounded hover:bg-destructive/10">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
