import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ScrollText, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuditLog, clearAuditLog, type AuditEntry } from "@/lib/payroll-audit";

const actionColor = (a: string) => {
  if (a.startsWith("payroll.locked") || a.includes("locked")) return "bg-success/10 text-success";
  if (a.startsWith("loan")) return "bg-orange-500/10 text-orange-600";
  if (a.startsWith("payroll.")) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
};

export default function PayrollAuditLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>(() => getAuditLog());
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState<string>("all");

  useEffect(() => {
    const i = setInterval(() => setEntries(getAuditLog()), 1500);
    return () => clearInterval(i);
  }, []);

  const actors = useMemo(() => Array.from(new Set(entries.map(e => e.actor))), [entries]);

  const filtered = useMemo(() => entries.filter(e => {
    if (actor !== "all" && e.actor !== actor) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return e.action.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q);
  }), [entries, query, actor]);

  const exportCsv = () => {
    const cols = ["Timestamp", "Actor", "Action", "Entity", "Detail"];
    const rows = filtered.map(e => [new Date(e.timestamp).toLocaleString(), e.actor, e.action, e.entity, e.detail]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payroll_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} className="h-8 text-xs pl-7 w-64" placeholder="Search action, entity, detail" />
        </div>
        <div>
          <Select value={actor} onValueChange={setActor}>
            <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Actors</SelectItem>
              {actors.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground font-mono-data">{filtered.length} entries</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-3 h-3" />Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-destructive" onClick={() => {
            if (!confirm("Clear all audit entries?")) return;
            clearAuditLog();
            setEntries([]);
            toast({ title: "Audit log cleared" });
          }}>
            <Trash2 className="w-3 h-3" />Clear
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No audit entries yet</p>
            <p className="text-[11px] text-muted-foreground mt-1">Actions like saving payroll, recording EMIs, or approving runs will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="nexus-table" style={{ minWidth: "900px" }}>
              <thead>
                <tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Detail</th></tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td className="text-[10px] text-muted-foreground font-mono-data whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="text-xs">{e.actor}</td>
                    <td><span className={`text-[10px] px-2 py-0.5 rounded-full font-mono-data ${actionColor(e.action)}`}>{e.action}</span></td>
                    <td className="text-xs">{e.entity}</td>
                    <td className="text-xs text-muted-foreground">{e.detail}</td>
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
