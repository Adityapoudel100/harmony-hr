import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, Bell, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/payroll-engine";

export interface SalaryContract {
  id: string;
  empName: string;
  designation: string;
  monthlySalary: number;
  contractType: "permanent" | "fixed-term" | "probation" | "internship";
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;   // ISO yyyy-mm-dd (revision/contract end)
  revisionCycleMonths: number; // reminder cycle
  reminderDays: number; // days before end to remind
  notes?: string;
  lastRevisedOn?: string;
}

const STORAGE_KEY = "cubit-salary-contracts";

const defaultContract = (): SalaryContract => {
  const today = new Date();
  const end = new Date();
  end.setFullYear(today.getFullYear() + 1);
  return {
    id: `c-${Date.now()}`,
    empName: "",
    designation: "",
    monthlySalary: 0,
    contractType: "permanent",
    startDate: today.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    revisionCycleMonths: 12,
    reminderDays: 30,
    notes: "",
  };
};

const seed: SalaryContract[] = [
  { id: "c-1", empName: "Aarav Bhandari", designation: "Sr. Developer", monthlySalary: 85000, contractType: "permanent", startDate: "2024-04-01", endDate: "2026-06-15", revisionCycleMonths: 12, reminderDays: 30, notes: "Annual appraisal pending" },
  { id: "c-2", empName: "Priya Sharma", designation: "DevOps Lead", monthlySalary: 95000, contractType: "fixed-term", startDate: "2025-01-15", endDate: "2026-01-14", revisionCycleMonths: 12, reminderDays: 45 },
  { id: "c-3", empName: "Raj Thapa", designation: "Campaign Mgr", monthlySalary: 65000, contractType: "probation", startDate: "2025-11-01", endDate: "2026-05-01", revisionCycleMonths: 6, reminderDays: 15 },
];

const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

const getStatus = (c: SalaryContract) => {
  const today = new Date();
  const end = new Date(c.endDate);
  const days = daysBetween(today, end);
  if (days < 0) return { label: "Expired", days, tone: "destructive" as const };
  if (days <= c.reminderDays) return { label: "Due Soon", days, tone: "warning" as const };
  return { label: "Active", days, tone: "success" as const };
};

export default function SalaryContracts() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<SalaryContract[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SalaryContract[]) : seed;
    } catch {
      return seed;
    }
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryContract | null>(null);
  const [filter, setFilter] = useState<"all" | "due" | "expired" | "active">("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  }, [contracts]);

  const enriched = useMemo(
    () => contracts.map((c) => ({ ...c, status: getStatus(c) })),
    [contracts]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return enriched;
    if (filter === "due") return enriched.filter((c) => c.status.tone === "warning");
    if (filter === "expired") return enriched.filter((c) => c.status.tone === "destructive");
    return enriched.filter((c) => c.status.tone === "success");
  }, [enriched, filter]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const due = enriched.filter((c) => c.status.tone === "warning").length;
    const expired = enriched.filter((c) => c.status.tone === "destructive").length;
    const totalMonthly = enriched.reduce((a, c) => a + (c.monthlySalary || 0), 0);
    return { total, due, expired, totalMonthly };
  }, [enriched]);

  const startAdd = () => {
    setEditing(defaultContract());
    setOpen(true);
  };
  const startEdit = (c: SalaryContract) => {
    setEditing({ ...c });
    setOpen(true);
  };
  const remove = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Contract removed" });
  };
  const save = () => {
    if (!editing) return;
    if (!editing.empName.trim()) {
      toast({ title: "Employee name is required", variant: "destructive" });
      return;
    }
    if (new Date(editing.endDate) < new Date(editing.startDate)) {
      toast({ title: "End date must be after start date", variant: "destructive" });
      return;
    }
    setContracts((prev) => {
      const exists = prev.some((c) => c.id === editing.id);
      return exists ? prev.map((c) => (c.id === editing.id ? editing : c)) : [...prev, editing];
    });
    setOpen(false);
    setEditing(null);
    toast({ title: "Contract saved" });
  };

  const markRevised = (c: SalaryContract) => {
    const today = new Date();
    const next = new Date();
    next.setMonth(today.getMonth() + (c.revisionCycleMonths || 12));
    setContracts((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, lastRevisedOn: today.toISOString().slice(0, 10), startDate: today.toISOString().slice(0, 10), endDate: next.toISOString().slice(0, 10) }
          : x
      )
    );
    toast({ title: `${c.empName} marked as revised`, description: `Next reminder on ${next.toISOString().slice(0, 10)}` });
  };

  const reminders = enriched.filter((c) => c.status.tone !== "success");

  const toneClass = (tone: "destructive" | "warning" | "success") =>
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "warning"
      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      : "bg-success/10 text-success";

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Contracts", value: String(stats.total), icon: CalendarClock, color: "text-primary" },
          { label: "Due for Revision", value: String(stats.due), icon: Bell, color: "text-orange-500" },
          { label: "Expired", value: String(stats.expired), icon: AlertTriangle, color: "text-destructive" },
          { label: "Monthly Payroll", value: `NPR ${fmt(stats.totalMonthly)}`, icon: CheckCircle2, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-xl font-semibold font-mono-data ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reminder banner */}
      {reminders.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-semibold">Salary Revision Reminders</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
              {reminders.length} alert{reminders.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1.5">
            {reminders.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span>
                  <span className="font-medium">{c.empName}</span>
                  <span className="text-muted-foreground"> · {c.designation || c.contractType}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${toneClass(c.status.tone)}`}>
                    {c.status.tone === "destructive"
                      ? `Expired ${Math.abs(c.status.days)}d ago`
                      : `Due in ${c.status.days}d`}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => markRevised(c)}>
                    Mark Revised
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header / actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Employee Salary & Contracts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track salary, contract period and revision reminders.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="active" className="text-xs">Active</SelectItem>
              <SelectItem value="due" className="text-xs">Due Soon</SelectItem>
              <SelectItem value="expired" className="text-xs">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 press-effect" onClick={startAdd}>
                <Plus className="w-3.5 h-3.5" />Add Salary Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing && contracts.some((c) => c.id === editing.id) ? "Edit" : "Add"} Salary Contract</DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Employee Name</label>
                      <Input value={editing.empName} onChange={(e) => setEditing({ ...editing, empName: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Designation</label>
                      <Input value={editing.designation} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Monthly Salary (NPR)</label>
                      <Input type="number" value={editing.monthlySalary} onChange={(e) => setEditing({ ...editing, monthlySalary: +e.target.value })} className="h-8 text-xs font-mono-data" min={0} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Contract Type</label>
                      <Select value={editing.contractType} onValueChange={(v) => setEditing({ ...editing, contractType: v as SalaryContract["contractType"] })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent" className="text-xs">Permanent</SelectItem>
                          <SelectItem value="fixed-term" className="text-xs">Fixed-term</SelectItem>
                          <SelectItem value="probation" className="text-xs">Probation</SelectItem>
                          <SelectItem value="internship" className="text-xs">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                      <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="h-8 text-xs font-mono-data" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">End / Revision Date</label>
                      <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} className="h-8 text-xs font-mono-data" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Revision Cycle (months)</label>
                      <Input type="number" value={editing.revisionCycleMonths} onChange={(e) => setEditing({ ...editing, revisionCycleMonths: +e.target.value })} className="h-8 text-xs font-mono-data" min={1} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Reminder (days before)</label>
                      <Input type="number" value={editing.reminderDays} onChange={(e) => setEditing({ ...editing, reminderDays: +e.target.value })} className="h-8 text-xs font-mono-data" min={1} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                    <Input value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="h-8 text-xs" placeholder="Optional notes" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
                    <Button size="sm" onClick={save}>Save</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="nexus-table" style={{ minWidth: "1100px" }}>
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Employee</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Monthly Salary</th>
                <th>Start</th>
                <th>End / Revision</th>
                <th>Cycle</th>
                <th>Status</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-xs text-muted-foreground py-8">No contracts match this filter</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id}>
                  <td className="font-mono-data text-xs text-muted-foreground">{i + 1}</td>
                  <td className="text-xs font-medium">{c.empName}</td>
                  <td className="text-xs">{c.designation || "—"}</td>
                  <td className="text-xs capitalize">{c.contractType}</td>
                  <td className="text-xs font-mono-data">NPR {fmt(c.monthlySalary)}</td>
                  <td className="text-xs font-mono-data">{c.startDate}</td>
                  <td className="text-xs font-mono-data">{c.endDate}</td>
                  <td className="text-xs font-mono-data">{c.revisionCycleMonths}m</td>
                  <td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${toneClass(c.status.tone)}`}>
                      {c.status.label}
                      {c.status.tone === "destructive" ? ` (${Math.abs(c.status.days)}d ago)` : c.status.tone === "warning" ? ` (${c.status.days}d)` : ""}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(c)} className="p-1 rounded hover:bg-muted transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => markRevised(c)} className="p-1 rounded hover:bg-success/10 transition-colors" title="Mark Revised">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      </button>
                      <button onClick={() => remove(c.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
