import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Wifi, WifiOff, RefreshCw, Settings2, AlertCircle, CheckCircle2, Plus, Save, Trash2, Calendar as CalendarIcon, Download, LogIn, LogOut, Timer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const todayLog = [
  { id: "EMP-1001", name: "Aarav Bhandari", department: "Engineering", checkIn: "08:02", checkOut: "17:10", hours: "9h 08m", status: "Present", source: "Biometric" },
  { id: "EMP-1002", name: "Priya Sharma", department: "Engineering", checkIn: "08:15", checkOut: "17:25", hours: "9h 10m", status: "Present", source: "Biometric" },
  { id: "EMP-1004", name: "Sita Magar", department: "HR", checkIn: "08:45", checkOut: "17:00", hours: "8h 15m", status: "Late", source: "Biometric" },
  { id: "EMP-1007", name: "Dipesh Karki", department: "Engineering", checkIn: "07:58", checkOut: "16:35", hours: "8h 37m", status: "Present", source: "Biometric" },
  { id: "EMP-1008", name: "Manisha Rai", department: "Design", checkIn: "08:10", checkOut: "—", hours: "Active", status: "Present", source: "Biometric" },
  { id: "EMP-1009", name: "Suresh Tamang", department: "Engineering", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", source: "—" },
  { id: "EMP-1010", name: "Kavita Shrestha", department: "Support", checkIn: "08:00", checkOut: "16:05", hours: "8h 05m", status: "Complete", source: "Biometric" },
  { id: "EMP-1003", name: "Raj Thapa", department: "Marketing", checkIn: "—", checkOut: "—", hours: "—", status: "On Leave", source: "—" },
];

// Monthly aggregated report (Jan 2024)
const monthlyReport = [
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
  Present: "status-active", Late: "status-pending", Absent: "status-resigned", Complete: "status-active", "On Leave": "status-onleave",
};

interface Device {
  id: string; name: string; ip: string; model: string; status: string; lastSync: string; port: string; protocol: string;
}

const deviceModels = [
  "ZKTeco SpeedFace-V5L", "ZKTeco ProFace X", "ZKTeco MultiBio 800",
  "ZKTeco ZFace-M", "ZKTeco uFace 800", "ZKTeco iClock 9000-G"
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Attendance() {
  const { isHR } = useRole();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [addDeviceDialog, setAddDeviceDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState("0"); // January
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "Main Entrance", ip: "192.168.1.201", model: "ZKTeco SpeedFace-V5L", status: "online", lastSync: "2 min ago", port: "4370", protocol: "TCP" },
    { id: "2", name: "Back Gate", ip: "192.168.1.202", model: "ZKTeco ProFace X", status: "online", lastSync: "5 min ago", port: "4370", protocol: "TCP" },
    { id: "3", name: "Parking", ip: "192.168.1.203", model: "ZKTeco MultiBio 800", status: "offline", lastSync: "3h ago", port: "4370", protocol: "TCP" },
  ]);
  const [newDevice, setNewDevice] = useState({ name: "", ip: "", port: "4370", model: "", protocol: "TCP" });

  const handleSync = () => { setSyncing(true); setTimeout(() => { setSyncing(false); toast({ title: "Sync complete", description: "All devices synced." }); }, 2000); };

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip) return;
    setDevices(prev => [...prev, { ...newDevice, id: String(Date.now()), status: "online", lastSync: "Just now" }]);
    setNewDevice({ name: "", ip: "", port: "4370", model: "", protocol: "TCP" });
    setAddDeviceDialog(false);
    toast({ title: "Device added" });
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    toast({ title: "Device removed" });
  };

  const handleExport = () => {
    toast({ title: "Report exported", description: `Monthly report for ${months[Number(selectedMonth)]} ${selectedYear} downloaded.` });
  };

  // Daily summary derived from todayLog
  const dailySummary = useMemo(() => ({
    present: todayLog.filter(r => r.status === "Present").length,
    complete: todayLog.filter(r => r.status === "Complete").length,
    late: todayLog.filter(r => r.status === "Late").length,
    absent: todayLog.filter(r => r.status === "Absent").length,
    leave: todayLog.filter(r => r.status === "On Leave").length,
  }), []);

  // Filter monthly report
  const filteredMonthly = useMemo(() => {
    return selectedEmployee === "all" ? monthlyReport : monthlyReport.filter(r => r.id === selectedEmployee);
  }, [selectedEmployee]);

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    const totalPresent = filteredMonthly.reduce((s, r) => s + r.present, 0);
    const totalLate = filteredMonthly.reduce((s, r) => s + r.late, 0);
    const totalAbsent = filteredMonthly.reduce((s, r) => s + r.absent, 0);
    const totalLeave = filteredMonthly.reduce((s, r) => s + r.leave, 0);
    return { totalPresent, totalLate, totalAbsent, totalLeave };
  }, [filteredMonthly]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily logs & monthly reports · Synced via ZKTeco ZKBioAccess
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={handleSync}>
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
          {isHR && (
            <Dialog open={configDialog} onOpenChange={setConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 press-effect">
                  <Settings2 className="w-3.5 h-3.5" />Device Config
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>ZKTeco Device Configuration</DialogTitle></DialogHeader>
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
                          <DialogHeader><DialogTitle>Add New Device</DialogTitle></DialogHeader>
                          <div className="space-y-3 pt-2">
                            <div><label className="text-xs text-muted-foreground mb-1 block">Device Name</label><Input value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="e.g., Floor 2 Entrance" className="h-8 text-sm" /></div>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-xs text-muted-foreground mb-1 block">IP Address</label><Input value={newDevice.ip} onChange={e => setNewDevice({ ...newDevice, ip: e.target.value })} placeholder="192.168.1.xxx" className="h-8 text-xs font-mono-data" /></div>
                              <div><label className="text-xs text-muted-foreground mb-1 block">Port</label><Input value={newDevice.port} onChange={e => setNewDevice({ ...newDevice, port: e.target.value })} className="h-8 text-xs font-mono-data" /></div>
                            </div>
                            <div><label className="text-xs text-muted-foreground mb-1 block">Model</label>
                              <Select value={newDevice.model} onValueChange={v => setNewDevice({ ...newDevice, model: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select model" /></SelectTrigger>
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

      {/* Tabs: Daily | Monthly */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList>
            <TabsTrigger value="daily" className="gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Daily Log</TabsTrigger>
            <TabsTrigger value="monthly" className="gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Monthly Report</TabsTrigger>
            <TabsTrigger value="devices" className="gap-1.5"><Wifi className="w-3.5 h-3.5" /> Devices</TabsTrigger>
          </TabsList>

          {/* DAILY TAB */}
          <TabsContent value="daily" className="space-y-5">
            {/* Summary cards */}
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

            {/* Daily table */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Today's Log · <span className="font-mono-data text-muted-foreground">Jan 15, 2024</span></h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Check-in / Check-out & total time present in office</p>
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
                  </tr>
                </thead>
                <tbody>
                  {todayLog.map(row => (
                    <tr key={row.id}>
                      <td className="font-mono-data text-xs text-muted-foreground">{row.id}</td>
                      <td className="text-sm font-medium">{row.name}</td>
                      <td className="text-xs text-muted-foreground">{row.department}</td>
                      <td className="font-mono-data text-xs">{row.checkIn}</td>
                      <td className="font-mono-data text-xs">{row.checkOut}</td>
                      <td className="font-mono-data text-xs font-semibold">{row.hours}</td>
                      <td className="text-xs text-muted-foreground">{row.source}</td>
                      <td><span className={`status-pill ${statusColors[row.status] ?? ""}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* MONTHLY TAB */}
          <TabsContent value="monthly" className="space-y-5">
            {/* Filters */}
            <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Period</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => <SelectItem key={m} value={String(i)} className="text-xs">{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["2023", "2024", "2025"].map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="h-6 w-px bg-border" />
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-8 w-48 text-xs"><SelectValue placeholder="All employees" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Employees</SelectItem>
                  {monthlyReport.map(e => <SelectItem key={e.id} value={e.id} className="text-xs">{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={handleExport}>
                  <Download className="w-3.5 h-3.5" /> Export Report
                </Button>
              </div>
            </div>

            {/* Monthly summary cards */}
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

            {/* Monthly Report table */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Monthly Attendance Report · <span className="font-mono-data text-muted-foreground">{months[Number(selectedMonth)]} {selectedYear}</span></h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Total time present, leaves, late arrivals, and absences per employee</p>
                </div>
              </div>
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th className="text-center">Working Days</th>
                    <th className="text-center text-success">Present</th>
                    <th className="text-center text-warning">Late</th>
                    <th className="text-center text-destructive">Absent</th>
                    <th className="text-center text-primary">Leave</th>
                    <th>Total Hours</th>
                    <th>Avg/Day</th>
                    <th>Overtime</th>
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
    </motion.div>
  );
}
