import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Plus, Trash2, Download, FileText, Users, DollarSign,
  AlertCircle, CheckCircle2, Save, Eye, X, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/contexts/RoleContext";
import {
  calculatePayroll, fmt, NEPALI_MONTHS, IRD_DATA,
  type PayrollEmployee, type PayrollResult, type TaxpayerType, type Gender
} from "@/lib/payroll-engine";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };

const defaultEmployee = (): PayrollEmployee => ({
  id: Date.now() + Math.random(),
  name: "", tp: "single", gd: "male", absentDays: 0, unpaidLeave: 0,
  monthlySalary: 0, disabled: false, pf: 0, dashain: 0,
  extraTime: 0, bonus: 0, cit: 0, healthInsurance: 0, lifeInsurance: 0,
});

const sampleEmployees: PayrollEmployee[] = [
  { id: 1, name: "Aarav Bhandari", tp: "single", gd: "male", absentDays: 0, unpaidLeave: 0, monthlySalary: 85000, disabled: false, pf: 0, dashain: 0, extraTime: 0, bonus: 0, cit: 0, healthInsurance: 0, lifeInsurance: 0 },
  { id: 2, name: "Priya Sharma", tp: "couple", gd: "female", absentDays: 1, unpaidLeave: 0, monthlySalary: 95000, disabled: false, pf: 0, dashain: 0, extraTime: 2000, bonus: 0, cit: 0, healthInsurance: 0, lifeInsurance: 0 },
  { id: 3, name: "Raj Thapa", tp: "single", gd: "male", absentDays: 2, unpaidLeave: 1, monthlySalary: 65000, disabled: false, pf: 5000, dashain: 0, extraTime: 0, bonus: 0, cit: 1000, healthInsurance: 0, lifeInsurance: 0 },
];

interface SavedPayslip {
  empName: string;
  month: string;
  year: string;
  result: PayrollResult;
}

export default function Payroll() {
  const { isHR } = useRole();
  const [activeTab, setActiveTab] = useState("payroll");
  const [employees, setEmployees] = useState<PayrollEmployee[]>(sampleEmployees);
  const [fyKey, setFyKey] = useState("2082/083");
  const [month, setMonth] = useState("7");
  const [year, setYear] = useState("2082");
  const [workingDays, setWorkingDays] = useState(30);
  const [processed, setProcessed] = useState(false);
  const [slipDialog, setSlipDialog] = useState<PayrollResult | null>(null);
  const [savedSlips, setSavedSlips] = useState<SavedPayslip[]>([]);

  const results = useMemo(() => {
    if (!processed) return [];
    return employees.map(emp => calculatePayroll(emp, fyKey, workingDays));
  }, [employees, fyKey, workingDays, processed]);

  const totals = useMemo(() => {
    if (!results.length) return { totalIncome: 0, totalTax: 0, totalNet: 0, totalSSF: 0, totalDeduct: 0 };
    return results.reduce((acc, r) => ({
      totalIncome: acc.totalIncome + r.totalIncome,
      totalTax: acc.totalTax + r.monthlyTax,
      totalNet: acc.totalNet + r.netPay,
      totalSSF: acc.totalSSF + r.ssf31,
      totalDeduct: acc.totalDeduct + r.totalDeduct,
    }), { totalIncome: 0, totalTax: 0, totalNet: 0, totalSSF: 0, totalDeduct: 0 });
  }, [results]);

  const updateEmployee = useCallback((id: number, key: keyof PayrollEmployee, value: any) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [key]: value } : e));
    setProcessed(false);
  }, []);

  const addEmployee = () => {
    setEmployees(prev => [...prev, defaultEmployee()]);
    setProcessed(false);
  };

  const removeEmployee = (id: number) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setProcessed(false);
  };

  const runPayroll = () => setProcessed(true);

  const saveMonth = () => {
    const monthName = NEPALI_MONTHS[parseInt(month) - 1];
    const newSlips = results.map(r => ({ empName: r.name, month: monthName, year, result: r }));
    setSavedSlips(prev => [...prev.filter(s => !(s.month === monthName && s.year === year)), ...newSlips]);
  };

  const exportCSV = () => {
    if (!results.length) return;
    const monthName = NEPALI_MONTHS[parseInt(month) - 1];
    const cols = ['#', 'Name', 'Type', 'Gender', 'Monthly Salary', 'Absent', 'Unpaid Leave', 'Actual Salary', 'Basic 60%', 'Allowance 40%', 'SSF 11%', 'SSF 20%', 'Dashain', 'Extra Time', 'Bonus', 'Total Income', 'SSF 31%', 'CIT', 'PF', 'TDS', 'Total Deductibles', 'Net Pay'];
    const rows = results.map((r, i) => [i + 1, r.name, r.tp, r.gd, r.monthlySalary, r.absentDays, r.unpaidLeave, r.actualSalary.toFixed(0), r.basic.toFixed(0), r.allowance.toFixed(0), r.ssf11.toFixed(0), r.ssf20.toFixed(0), r.dashain, r.extraTime, r.bonus, r.totalIncome.toFixed(0), r.ssf31.toFixed(0), r.cit, r.pf, r.monthlyTax.toFixed(0), r.totalDeduct.toFixed(0), r.netPay.toFixed(0)]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Payroll_${monthName}_${year}.csv`;
    a.click();
  };

  const exportIRD = () => {
    if (!results.length) return;
    const monthName = NEPALI_MONTHS[parseInt(month) - 1];
    const cols = ['Employee Name', 'Actual Salary', 'SSF 31%', 'Tax (TDS)', 'Net Salary'];
    const rows = results.map(r => [r.name, r.actualSalary.toFixed(0), r.ssf31.toFixed(0), r.monthlyTax.toFixed(0), r.netPay.toFixed(0)]);
    rows.push(['TOTAL', results.reduce((a, r) => a + r.actualSalary, 0).toFixed(0), results.reduce((a, r) => a + r.ssf31, 0).toFixed(0), results.reduce((a, r) => a + r.monthlyTax, 0).toFixed(0), results.reduce((a, r) => a + r.netPay, 0).toFixed(0)]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `IRD_TDS_${monthName}_${year}.csv`;
    a.click();
  };

  if (!isHR) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={item}>
          <h1 className="text-lg font-semibold">Payroll</h1>
          <p className="text-sm text-muted-foreground">You don't have access to this module. Contact your HR admin.</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Payroll</h1>
          <p className="text-sm text-muted-foreground">Nepal TDS & salary processing · IRD FY {fyKey}</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border p-1 h-auto">
            <TabsTrigger value="payroll" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calculator className="w-3.5 h-3.5" />Bulk Payroll
            </TabsTrigger>
            <TabsTrigger value="payslips" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Receipt className="w-3.5 h-3.5" />Pay Slips
            </TabsTrigger>
          </TabsList>

          {/* BULK PAYROLL */}
          <TabsContent value="payroll" className="space-y-4 mt-4">
            {/* Period Selection */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Payroll Period & Settings</h3>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Month</label>
                  <Select value={month} onValueChange={(v) => { setMonth(v); setProcessed(false); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NEPALI_MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)} className="text-xs">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                  <Input value={year} onChange={(e) => { setYear(e.target.value); setProcessed(false); }} className="h-8 text-xs font-mono-data" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Financial Year</label>
                  <Select value={fyKey} onValueChange={(v) => { setFyKey(v); setProcessed(false); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(IRD_DATA).map(fy => <SelectItem key={fy} value={fy} className="text-xs">{fy}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Working Days</label>
                  <Input type="number" value={workingDays} onChange={(e) => { setWorkingDays(+e.target.value); setProcessed(false); }} className="h-8 text-xs font-mono-data" min={1} max={31} />
                </div>
                <div className="flex items-end">
                  <Button size="sm" className="gap-1.5 w-full press-effect" onClick={runPayroll}>
                    <Calculator className="w-3.5 h-3.5" />
                    Process Payroll
                  </Button>
                </div>
              </div>
            </div>

            {/* Employee Input Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Employee Attendance & Salary Input</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono-data">{employees.length} employees</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7 press-effect" onClick={addEmployee}>
                    <Plus className="w-3 h-3" />Add Employee
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="nexus-table" style={{ minWidth: "1400px" }}>
                  <thead>
                    <tr>
                      <th className="w-8">#</th>
                      <th>Employee Name</th>
                      <th>Type</th>
                      <th>Gender</th>
                      <th>Absent</th>
                      <th>Unpaid Leave</th>
                      <th>Monthly Salary</th>
                      <th>PF</th>
                      <th>Dashain</th>
                      <th>Extra Time</th>
                      <th>Bonus</th>
                      <th>CIT</th>
                      <th>Health Ins.</th>
                      <th>Life Ins.</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={emp.id}>
                        <td className="font-mono-data text-xs text-muted-foreground">{i + 1}</td>
                        <td>
                          <Input value={emp.name} onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)} className="h-7 text-xs min-w-[140px]" placeholder="Employee name" />
                        </td>
                        <td>
                          <Select value={emp.tp} onValueChange={(v) => updateEmployee(emp.id, 'tp', v as TaxpayerType)}>
                            <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single" className="text-xs">Single</SelectItem>
                              <SelectItem value="couple" className="text-xs">Couple</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td>
                          <Select value={emp.gd} onValueChange={(v) => updateEmployee(emp.id, 'gd', v as Gender)}>
                            <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male" className="text-xs">Male</SelectItem>
                              <SelectItem value="female" className="text-xs">Female</SelectItem>
                              <SelectItem value="other" className="text-xs">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td><Input type="number" value={emp.absentDays} onChange={(e) => updateEmployee(emp.id, 'absentDays', +e.target.value)} className="h-7 text-xs w-16 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.unpaidLeave} onChange={(e) => updateEmployee(emp.id, 'unpaidLeave', +e.target.value)} className="h-7 text-xs w-16 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.monthlySalary} onChange={(e) => updateEmployee(emp.id, 'monthlySalary', +e.target.value)} className="h-7 text-xs w-24 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.pf} onChange={(e) => updateEmployee(emp.id, 'pf', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.dashain} onChange={(e) => updateEmployee(emp.id, 'dashain', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.extraTime} onChange={(e) => updateEmployee(emp.id, 'extraTime', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.bonus} onChange={(e) => updateEmployee(emp.id, 'bonus', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.cit} onChange={(e) => updateEmployee(emp.id, 'cit', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.healthInsurance} onChange={(e) => updateEmployee(emp.id, 'healthInsurance', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td><Input type="number" value={emp.lifeInsurance} onChange={(e) => updateEmployee(emp.id, 'lifeInsurance', +e.target.value)} className="h-7 text-xs w-20 font-mono-data" min={0} /></td>
                        <td>
                          <button onClick={() => removeEmployee(emp.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results */}
            {processed && results.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Employees", value: String(results.length), icon: Users, color: "text-primary" },
                    { label: "Total Gross", value: `NPR ${fmt(totals.totalIncome)}`, icon: DollarSign, color: "text-primary" },
                    { label: "Total TDS", value: `NPR ${fmt(totals.totalTax)}`, icon: AlertCircle, color: "text-destructive" },
                    { label: "Total Net", value: `NPR ${fmt(totals.totalNet)}`, icon: CheckCircle2, color: "text-success" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <p className={`text-xl font-semibold font-mono-data ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Results Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Payroll — {NEPALI_MONTHS[parseInt(month) - 1]} {year}
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7 press-effect" onClick={saveMonth}>
                        <Save className="w-3 h-3" />Save Month
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7 press-effect" onClick={exportCSV}>
                        <Download className="w-3 h-3" />Export CSV
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7 press-effect" onClick={exportIRD}>
                        <FileText className="w-3 h-3" />IRD File
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="nexus-table" style={{ minWidth: "1600px" }}>
                      <thead>
                        <tr>
                          <th className="w-8">#</th>
                          <th>Employee</th>
                          <th>Actual Salary</th>
                          <th>Basic (60%)</th>
                          <th>Allowance (40%)</th>
                          <th>SSF (11%)</th>
                          <th>SSF (20%)</th>
                          <th>Dashain</th>
                          <th>Extra/Bonus</th>
                          <th>Total Income</th>
                          <th>SSF (31%)</th>
                          <th>CIT</th>
                          <th>PF</th>
                          <th>TDS</th>
                          <th>Total Deduct</th>
                          <th>Net Pay</th>
                          <th>Eff. Rate</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={r.id} className="cursor-pointer" onClick={() => setSlipDialog(r)}>
                            <td className="font-mono-data text-xs text-muted-foreground">{i + 1}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                                  {(r.name || '?').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{r.name || '—'}</p>
                                  <p className="text-[10px] text-muted-foreground">{r.tp === 'couple' ? 'Couple' : 'Single'} · {r.gd}</p>
                                </div>
                              </div>
                            </td>
                            <td className="font-mono-data text-xs">{fmt(r.actualSalary)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.basic)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.allowance)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.ssf11)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.ssf20)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.dashain)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.extraTime + r.bonus)}</td>
                            <td className="font-mono-data text-xs font-semibold">{fmt(r.totalIncome)}</td>
                            <td className="font-mono-data text-xs text-destructive">{fmt(r.ssf31)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.cit)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.pf)}</td>
                            <td className="font-mono-data text-xs text-destructive">{fmt(r.monthlyTax)}</td>
                            <td className="font-mono-data text-xs">{fmt(r.totalDeduct)}</td>
                            <td className="font-mono-data text-xs font-semibold text-success">{fmt(r.netPay)}</td>
                            <td className="font-mono-data text-[10px] text-muted-foreground">{(r.effRate * 100).toFixed(1)}%</td>
                            <td>
                              <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={(e) => { e.stopPropagation(); setSlipDialog(r); }}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="bg-muted/30 font-semibold">
                          <td></td>
                          <td className="text-xs">Total · {results.length} employees</td>
                          <td className="font-mono-data text-xs">{fmt(results.reduce((a, r) => a + r.actualSalary, 0))}</td>
                          <td></td><td></td><td></td><td></td><td></td><td></td>
                          <td className="font-mono-data text-xs">{fmt(totals.totalIncome)}</td>
                          <td className="font-mono-data text-xs text-destructive">{fmt(totals.totalSSF)}</td>
                          <td></td><td></td>
                          <td className="font-mono-data text-xs text-destructive">{fmt(totals.totalTax)}</td>
                          <td className="font-mono-data text-xs">{fmt(totals.totalDeduct)}</td>
                          <td className="font-mono-data text-xs text-success">{fmt(totals.totalNet)}</td>
                          <td></td><td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* PAYSLIPS */}
          <TabsContent value="payslips" className="space-y-4 mt-4">
            <div className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Saved Pay Slips</h3>
                <span className="text-xs text-muted-foreground font-mono-data">{savedSlips.length} slips</span>
              </div>
              {savedSlips.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No pay slips saved yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Process payroll and click "Save Month" to generate pay slips</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 p-4">
                  {savedSlips.map((s, i) => (
                    <div key={i} className="bg-muted/30 border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSlipDialog(s.result)}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                          {s.empName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.empName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono-data">{s.month} {s.year}</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold font-mono-data text-success">NPR {fmt(s.result.netPay)}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Gross {fmt(s.result.totalIncome)}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">TDS {fmt(s.result.monthlyTax)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Payslip Dialog */}
      <Dialog open={!!slipDialog} onOpenChange={() => setSlipDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pay Slip — {NEPALI_MONTHS[parseInt(month) - 1]} {year}</DialogTitle>
          </DialogHeader>
          {slipDialog && (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Employee</span><p className="font-medium">{slipDialog.name}</p></div>
                <div><span className="text-muted-foreground">Period</span><p className="font-medium font-mono-data">{NEPALI_MONTHS[parseInt(month) - 1]} {year}</p></div>
                <div><span className="text-muted-foreground">Monthly Salary</span><p className="font-medium font-mono-data">NPR {fmt(slipDialog.monthlySalary)}</p></div>
                <div><span className="text-muted-foreground">Absent Days</span><p className="font-medium font-mono-data">{slipDialog.absentDays}</p></div>
              </div>

              {/* Income & Deductions Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Income</div>
                  {[
                    ["Actual Salary", slipDialog.actualSalary],
                    ["Basic (60%)", slipDialog.basic],
                    ["Allowance (40%)", slipDialog.allowance],
                    ["SSF Employer (11%)", slipDialog.ssf11],
                    ["SSF Employer (20%)", slipDialog.ssf20],
                    ...(slipDialog.dashain > 0 ? [["Dashain Bonus", slipDialog.dashain] as [string, number]] : []),
                    ...(slipDialog.extraTime > 0 ? [["Extra Time", slipDialog.extraTime] as [string, number]] : []),
                    ...(slipDialog.bonus > 0 ? [["Bonus", slipDialog.bonus] as [string, number]] : []),
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between px-3 py-2 border-t border-border text-xs">
                      <span>{label as string}</span>
                      <span className="font-mono-data">NPR {fmt(val as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 border-t border-border text-xs font-semibold bg-muted/30">
                    <span>Total Income</span>
                    <span className="font-mono-data">NPR {fmt(slipDialog.totalIncome)}</span>
                  </div>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deductibles</div>
                  {[
                    ["SSF Employee (31%)", slipDialog.ssf31],
                    ...(slipDialog.cit > 0 ? [["CIT", slipDialog.cit] as [string, number]] : []),
                    ...(slipDialog.pf > 0 ? [["PF", slipDialog.pf] as [string, number]] : []),
                    ["Income Tax (TDS)", slipDialog.monthlyTax],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between px-3 py-2 border-t border-border text-xs">
                      <span>{label as string}</span>
                      <span className="font-mono-data text-destructive">NPR {fmt(val as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 border-t border-border text-xs font-semibold bg-muted/30">
                    <span>Total Deductibles</span>
                    <span className="font-mono-data">NPR {fmt(slipDialog.totalDeduct)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-foreground text-background rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-50">Net Pay</p>
                  <p className="text-[10px] opacity-40 font-mono-data mt-0.5">{NEPALI_MONTHS[parseInt(month) - 1]} {year}</p>
                </div>
                <p className="text-xl font-semibold font-mono-data">NPR {fmt(slipDialog.netPay)}</p>
              </div>

              <p className="text-[10px] text-center text-muted-foreground">System-generated pay slip · Verify with IRD Nepal</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
