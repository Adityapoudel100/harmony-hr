import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Wifi, WifiOff, RefreshCw, Settings2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const todayLog = [
  { id: "EMP-1001", name: "Aarav Bhandari", checkIn: "08:02", checkOut: "—", hours: "6h 12m", status: "Present", source: "Biometric" },
  { id: "EMP-1002", name: "Priya Sharma", checkIn: "08:15", checkOut: "—", hours: "5h 59m", status: "Present", source: "Biometric" },
  { id: "EMP-1004", name: "Sita Magar", checkIn: "08:45", checkOut: "—", hours: "5h 29m", status: "Late", source: "Biometric" },
  { id: "EMP-1007", name: "Dipesh Karki", checkIn: "07:58", checkOut: "—", hours: "6h 16m", status: "Present", source: "Biometric" },
  { id: "EMP-1009", name: "Suresh Tamang", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", source: "—" },
  { id: "EMP-1010", name: "Kavita Shrestha", checkIn: "08:00", checkOut: "16:05", hours: "8h 05m", status: "Complete", source: "Biometric" },
];

const statusColors: Record<string, string> = {
  Present: "status-active",
  Late: "status-pending",
  Absent: "status-resigned",
  Complete: "status-active",
};

const devices = [
  { name: "Main Entrance", ip: "192.168.1.201", model: "ZKTeco SpeedFace-V5L", status: "online", lastSync: "2 min ago" },
  { name: "Back Gate", ip: "192.168.1.202", model: "ZKTeco ProFace X", status: "online", lastSync: "5 min ago" },
  { name: "Parking", ip: "192.168.1.203", model: "ZKTeco MultiBio 800", status: "offline", lastSync: "3h ago" },
];

export default function Attendance() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Today's log · <span className="font-mono-data">Jan 15, 2024</span> · Synced via ZKTeco ZKBioAccess
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={handleSync}>
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 press-effect">
            <Settings2 className="w-3.5 h-3.5" />
            Device Config
          </Button>
        </div>
      </motion.div>

      {/* ZKTeco Device Status */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {devices.map((device) => (
          <div key={device.ip} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {device.status === "online" ? (
                  <Wifi className="w-4 h-4 text-success" />
                ) : (
                  <WifiOff className="w-4 h-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{device.name}</span>
              </div>
              <span className={`status-pill ${device.status === "online" ? "status-active" : "status-resigned"}`}>
                {device.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono-data text-[11px]">{device.model}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono-data text-[11px]">{device.ip}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-mono-data text-[11px]">{device.lastSync}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4">
        {[
          { label: "Present", value: "4", icon: CheckCircle2, color: "text-success" },
          { label: "Late", value: "1", icon: AlertCircle, color: "text-warning" },
          { label: "Absent", value: "1", icon: AlertCircle, color: "text-destructive" },
          { label: "On Leave", value: "2", icon: Clock, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono-data ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daily Log</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono-data">Shift: 08:00 — 16:00</span>
          </div>
        </div>
        <table className="nexus-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Hours</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {todayLog.map((row) => (
              <tr key={row.id}>
                <td className="font-mono-data text-xs text-muted-foreground">{row.id}</td>
                <td className="text-sm font-medium">{row.name}</td>
                <td className="font-mono-data text-xs">{row.checkIn}</td>
                <td className="font-mono-data text-xs">{row.checkOut}</td>
                <td className="font-mono-data text-xs">{row.hours}</td>
                <td className="text-xs text-muted-foreground">{row.source}</td>
                <td><span className={`status-pill ${statusColors[row.status]}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
