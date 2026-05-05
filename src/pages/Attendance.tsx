import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, Wifi, WifiOff, RefreshCw, Settings2, AlertCircle, CheckCircle2,
  Plus, Save, Trash2, Calendar as CalendarIcon, Download, LogIn, LogOut,
  Timer, TrendingUp, Pencil, Send, FileSpreadsheet, History, Inbox, Check, X
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RULES_KEY = "attendance_rules_v1";

interface AttendanceRules {
  shiftStart: string;       // "09:00"
  shiftEnd: string;         // "17:00"
  graceMinutes: number;     // late tolerance
  autoCheckoutEnabled: boolean;
  autoCheckoutTime: string; // "20:00"
  fullDayHours: number;     // for total time / payroll
  halfDayHours: number;
  offDays: number[];        // 0=Sun..6=Sat
  countOvertimeAfter: number; // minutes after shiftEnd
}

const DEFAULT_RULES: AttendanceRules = {
  shiftStart: "09:00",
  shiftEnd: "17:00",
  graceMinutes: 15,
  autoCheckoutEnabled: true,
  autoCheckoutTime: "20:00",
  fullDayHours: 8,
  halfDayHours: 4,
  offDays: [6, 0], // Sat, Sun
  countOvertimeAfter: 30,
};

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

// ───── Types ─────
interface DailyRow {
  id: string; name: string; department: string;
  checkIn: string; checkOut: string; hours: string;
  status: "Present" | "Late" | "Absent" | "Complete" | "On Leave";
  source: string; edited?: boolean; editNote?: string;
}
interface MonthlyRow {
  id: string; name: string; department: string; workingDays: number;
  present: number; late: number; absent: number; leave: number;
  totalHours: string; avgHours: string; overtime: string;
}
interface Device {
  id: string; name: string; ip: string; model: string;
  status: "online" | "offline"; lastSync: string; port: string; protocol: string;
}
interface AuditEntry {
  id: string; empId: string; date: string; field: string;
  oldValue: string; newValue: string; editor: string; reason: string; at: string;
}
interface CorrectionRequest {
  id: string;
  empId: string;
  empName: string;
  date: string;            // ISO date
  type: "check-in" | "check-out" | "both";
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}
const REQUESTS_KEY = "attendance_correction_requests_v1";

// ───── Mock Data ─────
const initialDaily: DailyRow[] = [
  { id: "EMP-1001", name: "Aarav Bhandari", department: "Engineering", checkIn: "08:02", checkOut: "17:10", hours: "9h 08m", status: "Present", source: "ZKTeco K40" },
  { id: "EMP-1002", name: "Priya Sharma", department: "Engineering", checkIn: "08:15", checkOut: "17:25", hours: "9h 10m", status: "Present", source: "ZKTeco K40" },
  { id: "EMP-1004", name: "Sita Magar", department: "HR", checkIn: "08:45", checkOut: "17:00", hours: "8h 15m", status: "Late", source: "ZKTeco K40" },
  { id: "EMP-1007", name: "Dipesh Karki", department: "Engineering", checkIn: "07:58", checkOut: "16:35", hours: "8h 37m", status: "Present", source: "ZKTeco K40" },
  { id: "EMP-1008", name: "Manisha Rai", department: "Design", checkIn: "08:10", checkOut: "—", hours: "Active", status: "Present", source: "ZKTeco K40" },
  { id: "EMP-1009", name: "Suresh Tamang", department: "Engineering", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", source: "—" },
  { id: "EMP-1010", name: "Kavita Shrestha", department: "Support", checkIn: "08:00", checkOut: "16:05", hours: "8h 05m", status: "Complete", source: "ZKTeco K40" },
  { id: "EMP-1003", name: "Raj Thapa", department: "Marketing", checkIn: "—", checkOut: "—", hours: "—", status: "On Leave", source: "—" },
];

const initialMonthly: MonthlyRow[] = [
  { id: "EMP-1001", name: "Aarav Bhandari", department: "Engineering", workingDays: 22, present: 20, late: 1, absent: 0, leave: 1, totalHours: "178h 30m", avgHours: "8h 55m", overtime: "6h 30m" },
  { id: "EMP-1002", name: "Priya Sharma", department: "Engineering", workingDays: 22, present: 21, late: 0, absent: 0, leave: 1, totalHours: "184h 15m", avgHours: "8h 46m", overtime: "8h 15m" },
  { id: "EMP-1003", name: "Raj Thapa", department: "Marketing", workingDays: 22, present: 17, late: 2, absent: 0, leave: 5, totalHours: "146h 00m", avgHours: "8h 35m", overtime: "0h" },
  { id: "EMP-1004", name: "Sita Magar", department: "HR", workingDays: 22, present: 19, late: 3, absent: 0, leave: 0, totalHours: "165h 45m", avgHours: "8h 43m", overtime: "1h 45m" },
  { id: "EMP-1006", name: "Anita KC", department: "Finance", workingDays: 22, present: 22, late: 0, absent: 0, leave: 0, totalHours: "184h 00m", avgHours: "8h 21m", overtime: "0h" },
  { id: "EMP-1007", name: "Dipesh Karki", department: "Engineering", workingDays: 22, present: 18, late: 1, absent: 1, leave: 2, totalHours: "152h 20m", avgHours: "8h 28m", overtime: "0h" },
  { id: "EMP-1008", name: "Manisha Rai", department: "Design", workingDays: 22, present: 20, late: 2, absent: 0, leave: 0, totalHours: "170h 00m", avgHours: "8h 30m", overtime: "2h 00m" },
  { id: "EMP-1009", name: "Suresh Tamang", department: "Engineering", workingDays: 22, present: 15, late: 4, absent: 3, leave: 0, totalHours: "128h 10m", avgHours: "8h 32m", overtime: "0h" },
  { id: "EMP-1010", name: "Kavita Shrestha", department: "Support", workingDays: 22, present: 22, late: 0, absent: 0, leave: 0, totalHours: "176h 30m", avgHours: "8h 01m", overtime: "0h 30m" },
];

const statusColors: Record<string, string> = {
  Present: "status-active", Late: "status-pending", Absent: "status-resigned",
  Complete: "status-active", "On Leave": "status-onleave",
};

const deviceModels = [
  "ZKTeco K40 (4.3\" TFT)",
  "ZKTeco K40 Pro",
  "ZKTeco SpeedFace-V5L",
  "ZKTeco ProFace X",
  "ZKTeco MultiBio 800",
  "ZKTeco uFace 800",
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ───── Helpers ─────
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function diffHours(inT: string, outT: string): string {
  if (!HHMM_RE.test(inT) || !HHMM_RE.test(outT)) return "—";
  const [ih, im] = inT.split(":").map(Number);
  const [oh, om] = outT.split(":").map(Number);
  let mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return "—";
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

export default function Attendance() {
  const { isHR, isEmployee } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [addDeviceDialog, setAddDeviceDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState("0");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  const [dailyLog, setDailyLog] = useState<DailyRow[]>(initialDaily);
  const [monthlyData] = useState<MonthlyRow[]>(initialMonthly);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditDialog, setAuditDialog] = useState(false);
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [requestDialog, setRequestDialog] = useState(false);
  const [inboxDialog, setInboxDialog] = useState(false);
  const [reqDraft, setReqDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "check-in" as CorrectionRequest["type"],
    requestedCheckIn: "",
    requestedCheckOut: "",
    reason: "",
  });

  // Identify which row belongs to the logged-in employee (demo: match by name, fallback EMP-1001)
  const myEmpId = useMemo(() => {
    if (!isEmployee) return null;
    const match = initialDaily.find(r => r.name.toLowerCase() === (user?.name || "").toLowerCase());
    return match?.id ?? "EMP-1001";
  }, [isEmployee, user]);
  const me = useMemo(() => initialDaily.find(r => r.id === myEmpId), [myEmpId]);

  // Edit dialog state
  const [editRow, setEditRow] = useState<DailyRow | null>(null);
  const [editDraft, setEditDraft] = useState<{ checkIn: string; checkOut: string; status: DailyRow["status"]; reason: string }>({
    checkIn: "", checkOut: "", status: "Present", reason: ""
  });

  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "Main Entrance", ip: "192.168.1.201", model: "ZKTeco K40 (4.3\" TFT)", status: "online", lastSync: "2 min ago", port: "4370", protocol: "TCP" },
    { id: "2", name: "Back Gate", ip: "192.168.1.202", model: "ZKTeco K40 Pro", status: "online", lastSync: "5 min ago", port: "4370", protocol: "TCP" },
    { id: "3", name: "Parking", ip: "192.168.1.203", model: "ZKTeco MultiBio 800", status: "offline", lastSync: "3h ago", port: "4370", protocol: "TCP" },
  ]);
  const [newDevice, setNewDevice] = useState({ name: "", ip: "", port: "4370", model: "ZKTeco K40 (4.3\" TFT)", protocol: "TCP" });

  // Persist audit log locally
  useEffect(() => {
    const stored = localStorage.getItem("attendance_audit_log");
    if (stored) setAuditLog(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("attendance_audit_log", JSON.stringify(auditLog));
  }, [auditLog]);

  // Persist correction requests
  useEffect(() => {
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (stored) {
      try { setRequests(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }, [requests]);

  const submitCorrectionRequest = () => {
    if (!reqDraft.reason.trim()) {
      toast({ title: "Reason required", description: "Please describe what went wrong.", variant: "destructive" });
      return;
    }
    if (reqDraft.type !== "check-out" && !reqDraft.requestedCheckIn) {
      toast({ title: "Check-in time required", variant: "destructive" });
      return;
    }
    if (reqDraft.type !== "check-in" && !reqDraft.requestedCheckOut) {
      toast({ title: "Check-out time required", variant: "destructive" });
      return;
    }
    const req: CorrectionRequest = {
      id: `REQ-${Date.now()}`,
      empId: myEmpId || "EMP-?",
      empName: user?.name || me?.name || "Employee",
      date: reqDraft.date,
      type: reqDraft.type,
      requestedCheckIn: reqDraft.type !== "check-out" ? reqDraft.requestedCheckIn : undefined,
      requestedCheckOut: reqDraft.type !== "check-in" ? reqDraft.requestedCheckOut : undefined,
      reason: reqDraft.reason.trim(),
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setRequests(prev => [req, ...prev]);
    setRequestDialog(false);
    setReqDraft({ date: new Date().toISOString().slice(0, 10), type: "check-in", requestedCheckIn: "", requestedCheckOut: "", reason: "" });
    toast({ title: "Request submitted", description: "HR/Admin will review your attendance correction." });
  };

  const reviewRequest = (id: string, decision: "Approved" | "Rejected", note?: string) => {
    let approved: CorrectionRequest | undefined;
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      approved = { ...r, status: decision, reviewedBy: user?.name || "HR Admin", reviewNote: note, reviewedAt: new Date().toISOString() };
      return approved;
    }));
    if (decision === "Approved" && approved) {
      // Apply to daily log if same employee row exists
      setDailyLog(prev => prev.map(row => {
        if (row.id !== approved!.empId) return row;
        const newIn = approved!.requestedCheckIn ?? row.checkIn;
        const newOut = approved!.requestedCheckOut ?? row.checkOut;
        const newHours = HHMM_RE.test(newIn) && HHMM_RE.test(newOut) ? diffHours(newIn, newOut) : row.hours;
        return { ...row, checkIn: newIn, checkOut: newOut, hours: newHours, status: "Present", source: "Approved Request", edited: true, editNote: approved!.reason };
      }));
      const now = new Date().toISOString();
      setAuditLog(prev => [{
        id: `${Date.now()}-req`, empId: approved!.empId, date: approved!.date, field: "Correction Approved",
        oldValue: "missed punch", newValue: `${approved!.requestedCheckIn ?? "—"} / ${approved!.requestedCheckOut ?? "—"}`,
        editor: user?.name || "HR Admin", reason: approved!.reason, at: now,
      }, ...prev].slice(0, 200));
    }
    toast({ title: `Request ${decision.toLowerCase()}` });
  };

  const myRequests = useMemo(() => requests.filter(r => r.empId === myEmpId), [requests, myEmpId]);
  const pendingRequests = useMemo(() => requests.filter(r => r.status === "Pending"), [requests]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast({ title: "Sync complete", description: "Pulled latest punches from ZKTeco K40 devices via ZKBioAccess." });
    }, 1500);
  };

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip) {
      toast({ title: "Missing fields", description: "Device name and IP are required.", variant: "destructive" });
      return;
    }
    setDevices(prev => [...prev, { ...newDevice, id: String(Date.now()), status: "online", lastSync: "Just now" }]);
    setNewDevice({ name: "", ip: "", port: "4370", model: "ZKTeco K40 (4.3\" TFT)", protocol: "TCP" });
    setAddDeviceDialog(false);
    toast({ title: "Device added" });
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    toast({ title: "Device removed" });
  };

  // Open edit dialog
  const openEdit = (row: DailyRow) => {
    setEditRow(row);
    setEditDraft({
      checkIn: HHMM_RE.test(row.checkIn) ? row.checkIn : "",
      checkOut: HHMM_RE.test(row.checkOut) ? row.checkOut : "",
      status: row.status,
      reason: ""
    });
  };

  const saveEdit = () => {
    if (!editRow) return;
    if (!editDraft.reason.trim()) {
      toast({ title: "Reason required", description: "Please enter a reason for the manual edit.", variant: "destructive" });
      return;
    }
    const newHours = editDraft.checkIn && editDraft.checkOut
      ? diffHours(editDraft.checkIn, editDraft.checkOut)
      : (editDraft.status === "Absent" || editDraft.status === "On Leave") ? "—" : editRow.hours;

    const entries: AuditEntry[] = [];
    const now = new Date().toISOString();
    const editor = "HR Admin";
    if (editDraft.checkIn !== editRow.checkIn) {
      entries.push({ id: `${Date.now()}-in`, empId: editRow.id, date: "Today", field: "Check-in", oldValue: editRow.checkIn, newValue: editDraft.checkIn || "—", editor, reason: editDraft.reason, at: now });
    }
    if (editDraft.checkOut !== editRow.checkOut) {
      entries.push({ id: `${Date.now()}-out`, empId: editRow.id, date: "Today", field: "Check-out", oldValue: editRow.checkOut, newValue: editDraft.checkOut || "—", editor, reason: editDraft.reason, at: now });
    }
    if (editDraft.status !== editRow.status) {
      entries.push({ id: `${Date.now()}-st`, empId: editRow.id, date: "Today", field: "Status", oldValue: editRow.status, newValue: editDraft.status, editor, reason: editDraft.reason, at: now });
    }
    if (entries.length) setAuditLog(prev => [...entries, ...prev].slice(0, 200));

    setDailyLog(prev => prev.map(r => r.id === editRow.id ? {
      ...r,
      checkIn: editDraft.checkIn || "—",
      checkOut: editDraft.checkOut || "—",
      hours: newHours,
      status: editDraft.status,
      source: "Manual Edit",
      edited: true,
      editNote: editDraft.reason,
    } : r));

    toast({ title: "Attendance updated", description: `${editRow.name}'s record was edited successfully.` });
    setEditRow(null);
  };

  const handleExport = () => {
    const rows = filteredMonthly;
    const csv = [
      ["Employee ID", "Name", "Department", "Working Days", "Present", "Late", "Absent", "Leave", "Total Hours", "Avg Hours", "Overtime"].join(","),
      ...rows.map(r => [r.id, r.name, r.department, r.workingDays, r.present, r.late, r.absent, r.leave, `"${r.totalHours}"`, `"${r.avgHours}"`, `"${r.overtime}"`].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${months[Number(selectedMonth)]}-${selectedYear}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: `Downloaded CSV for ${months[Number(selectedMonth)]} ${selectedYear}.` });
  };

  const handlePushToPayroll = () => {
    const payload = {
      month: months[Number(selectedMonth)],
      year: selectedYear,
      generatedAt: new Date().toISOString(),
      employees: filteredMonthly.map(r => ({
        id: r.id, name: r.name, department: r.department,
        workingDays: r.workingDays, presentDays: r.present + r.late,
        absentDays: r.absent, leaveDays: r.leave,
        totalHours: r.totalHours, overtime: r.overtime,
      }))
    };
    localStorage.setItem("payroll_attendance_input", JSON.stringify(payload));
    toast({
      title: "Pushed to Payroll",
      description: `${payload.employees.length} employees · ${payload.month} ${payload.year}. Open Payroll to compute salary.`
    });
  };

  // Daily summary
  const dailySummary = useMemo(() => ({
    present: dailyLog.filter(r => r.status === "Present").length,
    complete: dailyLog.filter(r => r.status === "Complete").length,
    late: dailyLog.filter(r => r.status === "Late").length,
    absent: dailyLog.filter(r => r.status === "Absent").length,
    leave: dailyLog.filter(r => r.status === "On Leave").length,
  }), [dailyLog]);

  const filteredMonthly = useMemo(() => {
    if (isEmployee) return monthlyData.filter(r => r.id === myEmpId);
    return selectedEmployee === "all" ? monthlyData : monthlyData.filter(r => r.id === selectedEmployee);
  }, [selectedEmployee, monthlyData, isEmployee, myEmpId]);

  const monthlyTotals = useMemo(() => ({
    totalPresent: filteredMonthly.reduce((s, r) => s + r.present, 0),
    totalLate: filteredMonthly.reduce((s, r) => s + r.late, 0),
    totalAbsent: filteredMonthly.reduce((s, r) => s + r.absent, 0),
    totalLeave: filteredMonthly.reduce((s, r) => s + r.leave, 0),
  }), [filteredMonthly]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily logs · monthly reports · ZKTeco K40 biometric integration via ZKBioAccess
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEmployee && (
            <Button size="sm" className="gap-1.5 press-effect" onClick={() => setRequestDialog(true)}>
              <Send className="w-3.5 h-3.5" /> Request Correction
            </Button>
          )}
          {isHR && (
            <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={() => setInboxDialog(true)}>
              <Inbox className="w-3.5 h-3.5" /> Requests
              {pendingRequests.length > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-warning/15 text-warning font-mono-data">{pendingRequests.length}</span>}
            </Button>
          )}
          {isHR && (
            <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={() => setAuditDialog(true)}>
              <History className="w-3.5 h-3.5" /> Audit Log
              {auditLog.length > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono-data">{auditLog.length}</span>}
            </Button>
          )}
          {isHR && (
            <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={handleSync}>
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          )}
          {isHR && (
            <Dialog open={configDialog} onOpenChange={setConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 press-effect">
                  <Settings2 className="w-3.5 h-3.5" />Device Config
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ZKTeco Device Configuration</DialogTitle>
                  <DialogDescription>Connect ZKTeco K40 biometric devices via ZKBioAccess Web API.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3">ZKBioAccess API Connection</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground mb-1 block">API Base URL</label><Input defaultValue="https://zkbio.company.com/api" className="h-8 text-xs font-mono-data" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">API Key</label><Input defaultValue="••••••••••••" type="password" className="h-8 text-xs font-mono-data" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">Sync Interval</label>
                        <Select defaultValue="5">
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Every 1 minute</SelectItem>
                            <SelectItem value="5">Every 5 minutes</SelectItem>
                            <SelectItem value="15">Every 15 minutes</SelectItem>
                            <SelectItem value="30">Every 30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">Connection Status</label>
                        <div className="flex items-center gap-2 h-8"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /><span className="text-xs text-success font-medium">Connected</span></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">Registered Devices</h4>
                      <Dialog open={addDeviceDialog} onOpenChange={setAddDeviceDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs"><Plus className="w-3 h-3" /> Add Device</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>Add ZKTeco Device</DialogTitle></DialogHeader>
                          <div className="space-y-3 pt-2">
                            <div><label className="text-xs text-muted-foreground mb-1 block">Device Name</label><Input value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="e.g., Floor 2 Entrance" className="h-8 text-sm" /></div>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-xs text-muted-foreground mb-1 block">IP Address</label><Input value={newDevice.ip} onChange={e => setNewDevice({ ...newDevice, ip: e.target.value })} placeholder="192.168.1.xxx" className="h-8 text-xs font-mono-data" /></div>
                              <div><label className="text-xs text-muted-foreground mb-1 block">Port</label><Input value={newDevice.port} onChange={e => setNewDevice({ ...newDevice, port: e.target.value })} className="h-8 text-xs font-mono-data" /></div>
                            </div>
                            <div><label className="text-xs text-muted-foreground mb-1 block">Model</label>
                              <Select value={newDevice.model} onValueChange={v => setNewDevice({ ...newDevice, model: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{deviceModels.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <Button variant="outline" size="sm" onClick={() => setAddDeviceDialog(false)}>Cancel</Button>
                              <Button size="sm" onClick={handleAddDevice}>Add Device</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {devices.map(device => (
                        <div key={device.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            {device.status === "online" ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                            <div>
                              <p className="text-sm font-medium">{device.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono-data">{device.ip}:{device.port} · {device.model}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`status-pill ${device.status === "online" ? "status-active" : "status-resigned"}`}>{device.status}</span>
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDeleteDevice(device.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setConfigDialog(false)}>Cancel</Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { setConfigDialog(false); toast({ title: "Configuration saved" }); }}>
                      <Save className="w-3.5 h-3.5" /> Save Configuration
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList>
            <TabsTrigger value="daily" className="gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {isEmployee ? "My Daily Log" : "Daily Log"}</TabsTrigger>
            <TabsTrigger value="monthly" className="gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {isEmployee ? "My Monthly Report" : "Monthly Report"}</TabsTrigger>
            {isEmployee && <TabsTrigger value="requests" className="gap-1.5"><Send className="w-3.5 h-3.5" /> My Requests{myRequests.length > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono-data">{myRequests.length}</span>}</TabsTrigger>}
            {!isEmployee && <TabsTrigger value="devices" className="gap-1.5"><Wifi className="w-3.5 h-3.5" /> Devices</TabsTrigger>}
          </TabsList>

          {/* DAILY TAB */}
          <TabsContent value="daily" className="space-y-5">
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Present", value: dailySummary.present, icon: CheckCircle2, color: "text-success" },
                { label: "Completed", value: dailySummary.complete, icon: LogOut, color: "text-primary" },
                { label: "Late", value: dailySummary.late, icon: AlertCircle, color: "text-warning" },
                { label: "Absent", value: dailySummary.absent, icon: AlertCircle, color: "text-destructive" },
                { label: "On Leave", value: dailySummary.leave, icon: Clock, color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold font-mono-data ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Today's Log · <span className="font-mono-data text-muted-foreground">Jan 15, 2024</span></h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Check-in / Check-out & total time present in office. Click <Pencil className="w-3 h-3 inline -mt-0.5" /> to edit.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono-data">Shift: 09:00 — 17:00</span>
                </div>
              </div>
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th><div className="flex items-center gap-1"><LogIn className="w-3 h-3" /> Check-in</div></th>
                    <th><div className="flex items-center gap-1"><LogOut className="w-3 h-3" /> Check-out</div></th>
                    <th><div className="flex items-center gap-1"><Timer className="w-3 h-3" /> Total Time</div></th>
                    <th>Source</th>
                    <th>Status</th>
                    {isHR && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(isEmployee ? dailyLog.filter(r => r.id === myEmpId) : dailyLog).map(row => (
                    <tr key={row.id}>
                      <td className="font-mono-data text-xs text-muted-foreground">{row.id}</td>
                      <td className="text-sm font-medium">
                        {row.name}
                        {row.edited && <span title={row.editNote} className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">edited</span>}
                      </td>
                      <td className="text-xs text-muted-foreground">{row.department}</td>
                      <td className="font-mono-data text-xs">{row.checkIn}</td>
                      <td className="font-mono-data text-xs">{row.checkOut}</td>
                      <td className="font-mono-data text-xs font-semibold">{row.hours}</td>
                      <td className="text-xs text-muted-foreground">{row.source}</td>
                      <td><span className={`status-pill ${statusColors[row.status] ?? ""}`}>{row.status}</span></td>
                      {isHR && (
                        <td className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={() => openEdit(row)}>
                            <Pencil className="w-3 h-3" /> <span className="text-xs">Edit</span>
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEmployee && !dailyLog.find(r => r.id === myEmpId) && (
                    <tr><td colSpan={8} className="text-center text-xs text-muted-foreground py-6">No attendance record for today. If you forgot to punch, click <span className="font-semibold">Request Correction</span>.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* MONTHLY TAB */}
          <TabsContent value="monthly" className="space-y-5">
            <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Period</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{months.map((m, i) => <SelectItem key={m} value={String(i)} className="text-xs">{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["2023", "2024", "2025"].map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}</SelectContent>
              </Select>
              {!isEmployee && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="h-8 w-48 text-xs"><SelectValue placeholder="All employees" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Employees</SelectItem>
                      {monthlyData.map(e => <SelectItem key={e.id} value={e.id} className="text-xs">{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={handleExport}>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                </Button>
                {isHR && (
                  <Button size="sm" className="gap-1.5 press-effect" onClick={handlePushToPayroll}>
                    <Send className="w-3.5 h-3.5" /> Push to Payroll
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Present Days", value: monthlyTotals.totalPresent, icon: CheckCircle2, color: "text-success" },
                { label: "Late Arrivals", value: monthlyTotals.totalLate, icon: AlertCircle, color: "text-warning" },
                { label: "Absent Days", value: monthlyTotals.totalAbsent, icon: AlertCircle, color: "text-destructive" },
                { label: "Leave Days", value: monthlyTotals.totalLeave, icon: Clock, color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold font-mono-data ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold">Monthly Attendance Report · <span className="font-mono-data text-muted-foreground">{months[Number(selectedMonth)]} {selectedYear}</span></h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total time present, leaves, late arrivals, and absences per employee. Push to Payroll to feed salary calculation.</p>
              </div>
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Employee</th><th>Department</th>
                    <th className="text-center">Working Days</th>
                    <th className="text-center text-success">Present</th>
                    <th className="text-center text-warning">Late</th>
                    <th className="text-center text-destructive">Absent</th>
                    <th className="text-center text-primary">Leave</th>
                    <th>Total Hours</th><th>Avg/Day</th><th>Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMonthly.map(row => {
                    const attendanceRate = ((row.present / row.workingDays) * 100).toFixed(0);
                    return (
                      <tr key={row.id}>
                        <td className="font-mono-data text-xs text-muted-foreground">{row.id}</td>
                        <td>
                          <div className="text-sm font-medium">{row.name}</div>
                          <div className="text-[11px] text-muted-foreground">{attendanceRate}% attendance</div>
                        </td>
                        <td className="text-xs text-muted-foreground">{row.department}</td>
                        <td className="text-center font-mono-data text-xs">{row.workingDays}</td>
                        <td className="text-center font-mono-data text-xs font-semibold text-success">{row.present}</td>
                        <td className="text-center font-mono-data text-xs font-semibold text-warning">{row.late}</td>
                        <td className="text-center font-mono-data text-xs font-semibold text-destructive">{row.absent}</td>
                        <td className="text-center font-mono-data text-xs font-semibold text-primary">{row.leave}</td>
                        <td className="font-mono-data text-xs font-semibold">{row.totalHours}</td>
                        <td className="font-mono-data text-xs">{row.avgHours}</td>
                        <td className="font-mono-data text-xs text-accent">{row.overtime}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* DEVICES TAB */}
          <TabsContent value="devices" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Biometric Devices</h2>
              {isHR && (
                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs press-effect" onClick={() => setConfigDialog(true)}>
                  <Settings2 className="w-3 h-3" /> Manage Devices
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {devices.map(device => (
                <div key={device.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {device.status === "online" ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <span className={`status-pill ${device.status === "online" ? "status-active" : "status-resigned"}`}>{device.status}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Model</span><span className="font-mono-data text-[11px]">{device.model}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">IP Address</span><span className="font-mono-data text-[11px]">{device.ip}:{device.port}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Last Sync</span><span className="font-mono-data text-[11px]">{device.lastSync}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ───── Edit Attendance Dialog ───── */}
      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              {editRow && <span>{editRow.name} · <span className="font-mono-data">{editRow.id}</span></span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Check-in</label>
                <Input type="time" value={editDraft.checkIn} onChange={e => setEditDraft(d => ({ ...d, checkIn: e.target.value }))} className="h-9 font-mono-data" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Check-out</label>
                <Input type="time" value={editDraft.checkOut} onChange={e => setEditDraft(d => ({ ...d, checkOut: e.target.value }))} className="h-9 font-mono-data" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={editDraft.status} onValueChange={(v: DailyRow["status"]) => setEditDraft(d => ({ ...d, status: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reason for edit <span className="text-destructive">*</span></label>
              <Input
                value={editDraft.reason}
                onChange={e => setEditDraft(d => ({ ...d, reason: e.target.value }))}
                placeholder="e.g., Forgot to punch out, Device malfunction"
                className="h-9 text-sm"
              />
            </div>
            {editDraft.checkIn && editDraft.checkOut && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2 font-mono-data">
                Computed total time: <span className="font-semibold text-foreground">{diffHours(editDraft.checkIn, editDraft.checkOut)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditRow(null)}>Cancel</Button>
            <Button size="sm" className="gap-1.5" onClick={saveEdit}>
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Audit Log Dialog ───── */}
      <Dialog open={auditDialog} onOpenChange={setAuditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manual Edit Audit Log</DialogTitle>
            <DialogDescription>All manual changes to attendance records are tracked here.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">No manual edits yet.</div>
            ) : (
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>When</th><th>Employee</th><th>Field</th>
                    <th>Old</th><th>New</th><th>Reason</th><th>Editor</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(a => (
                    <tr key={a.id}>
                      <td className="text-[11px] text-muted-foreground font-mono-data">{new Date(a.at).toLocaleString()}</td>
                      <td className="text-xs font-mono-data">{a.empId}</td>
                      <td className="text-xs">{a.field}</td>
                      <td className="text-xs font-mono-data text-destructive">{a.oldValue}</td>
                      <td className="text-xs font-mono-data text-success">{a.newValue}</td>
                      <td className="text-xs text-muted-foreground">{a.reason}</td>
                      <td className="text-xs">{a.editor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAuditDialog(false)}>Close</Button>
            {auditLog.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setAuditLog([]); toast({ title: "Audit log cleared" }); }}>
                <Trash2 className="w-3.5 h-3.5" /> Clear Log
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
