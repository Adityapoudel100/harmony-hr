import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, CheckCircle2, AlertCircle, PlayCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ALLOWED_VARIABLES, validateFormula, evaluateFormula, buildScope,
  type CustomFormula,
} from "@/lib/formula-engine";
import { calculatePayroll, fmt, type PayrollEmployee } from "@/lib/payroll-engine";

const STORAGE_KEY = "cubit.payroll.customFormulas.v1";

interface Props {
  sampleEmployees: PayrollEmployee[];
  fyKey: string;
  workingDays: number;
}

const blank = (): CustomFormula => ({
  id: crypto.randomUUID(),
  name: "Net Salary (Custom)",
  formula: "gross_salary - tax - pf - cit - ssf",
  description: "",
  isActive: false,
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function FormulaBuilder({ sampleEmployees, fyKey, workingDays }: Props) {
  const { toast } = useToast();
  const [formulas, setFormulas] = useState<CustomFormula[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [blank()];
    } catch {
      return [blank()];
    }
  });
  const [selectedId, setSelectedId] = useState<string>(() => formulas[0]?.id ?? "");
  const [draftFormula, setDraftFormula] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [testEmpId, setTestEmpId] = useState<string>(() => String(sampleEmployees[0]?.id ?? ""));
  const [testResult, setTestResult] = useState<{ ok: boolean; value?: number; error?: string } | null>(null);

  const selected = formulas.find(f => f.id === selectedId);

  useEffect(() => {
    if (selected) {
      setDraftName(selected.name);
      setDraftFormula(selected.formula);
      setDraftDesc(selected.description ?? "");
      setTestResult(null);
    }
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
  }, [formulas]);

  const validation = useMemo(() => validateFormula(draftFormula), [draftFormula]);

  const insertVar = (v: string) => {
    setDraftFormula(prev => (prev ? `${prev} ${v}` : v));
  };

  const handleSave = () => {
    if (!validation.valid) {
      toast({ title: "Cannot save", description: validation.error, variant: "destructive" });
      return;
    }
    if (!draftName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setFormulas(prev => prev.map(f => f.id === selectedId ? {
      ...f,
      name: draftName.trim(),
      formula: draftFormula.trim(),
      description: draftDesc.trim(),
      version: f.formula !== draftFormula.trim() ? f.version + 1 : f.version,
      updatedAt: new Date().toISOString(),
    } : f));
    toast({ title: "Formula saved" });
  };

  const handleTest = () => {
    if (!validation.valid) {
      setTestResult({ ok: false, error: validation.error });
      return;
    }
    const emp = sampleEmployees.find(e => String(e.id) === testEmpId);
    if (!emp) {
      setTestResult({ ok: false, error: "Pick a sample employee" });
      return;
    }
    const r = calculatePayroll(emp, fyKey, workingDays);
    const out = evaluateFormula(draftFormula, buildScope(r, workingDays));
    setTestResult(out.ok ? { ok: true, value: out.value } : { ok: false, error: out.error });
  };

  const handleAdd = () => {
    const f = blank();
    setFormulas(prev => [...prev, f]);
    setSelectedId(f.id);
  };

  const handleDelete = (id: string) => {
    setFormulas(prev => {
      const next = prev.filter(f => f.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id ?? "");
      return next;
    });
  };

  const toggleActive = (id: string, active: boolean) => {
    setFormulas(prev => prev.map(f => f.id === id ? { ...f, isActive: active, updatedAt: new Date().toISOString() } : f));
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left: list */}
      <div className="col-span-4 bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Saved Formulas</h3>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleAdd}>
            <Plus className="w-3 h-3" />New
          </Button>
        </div>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {formulas.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No formulas yet</p>}
          {formulas.map(f => (
            <div
              key={f.id}
              className={`p-2 rounded border cursor-pointer ${selectedId === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
              onClick={() => setSelectedId(f.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{f.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{f.formula}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${f.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {f.isActive ? "ACTIVE" : "OFF"}
                  </span>
                  <Switch checked={f.isActive} onCheckedChange={v => toggleActive(f.id, v)} onClick={e => e.stopPropagation()} />
                  <button onClick={e => { e.stopPropagation(); handleDelete(f.id); }} className="p-0.5 rounded hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground mt-1">v{f.version} · updated {new Date(f.updatedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: editor */}
      <div className="col-span-8 bg-card border border-border rounded-lg p-4 space-y-3">
        {!selected ? (
          <p className="text-sm text-muted-foreground">Select or create a formula to edit.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Formula Name</label>
                <Input value={draftName} onChange={e => setDraftName(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input value={draftDesc} onChange={e => setDraftDesc(e.target.value)} className="h-8 text-xs" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Formula Expression</label>
              <Textarea
                value={draftFormula}
                onChange={e => setDraftFormula(e.target.value)}
                rows={3}
                className="text-xs font-mono"
                placeholder="gross_salary - tax - pf - cit"
              />
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {validation.valid ? (
                  <><CheckCircle2 className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Valid</span></>
                ) : (
                  <><AlertCircle className="w-3 h-3 text-destructive" /><span className="text-destructive">{validation.error}</span></>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Allowed Variables (click to insert)</label>
              <div className="flex flex-wrap gap-1.5">
                {ALLOWED_VARIABLES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="px-2 py-0.5 text-[10px] font-mono rounded border border-border hover:border-primary hover:bg-primary/5"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Operators: + − × ÷ ( ) and conditional (cond ? a : b). No <code>eval</code>, only whitelisted variables.
              </p>
            </div>

            <div className="border-t border-border pt-3">
              <label className="text-xs font-semibold mb-2 block">Test with Sample Employee</label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={testEmpId} onValueChange={setTestEmpId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sampleEmployees.map(e => (
                        <SelectItem key={e.id} value={String(e.id)} className="text-xs">
                          {e.name || `Employee ${e.id}`} — NPR {fmt(e.monthlySalary)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={handleTest}>
                  <PlayCircle className="w-3.5 h-3.5" />Run Test
                </Button>
                <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5" />Save
                </Button>
              </div>
              {testResult && (
                <div className={`mt-2 p-2 rounded text-xs ${testResult.ok ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                  {testResult.ok
                    ? <>Result: <span className="font-mono font-semibold">NPR {fmt(testResult.value!)}</span></>
                    : <>Error: {testResult.error}</>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
