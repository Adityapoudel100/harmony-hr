import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Wifi, WifiOff, RefreshCw, Settings2, AlertCircle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";

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

const initialDevices = [
  { id: "1", name: "Main Entrance", ip: "192.168.1.201", model: "ZKTeco SpeedFace-V5L", status: "online", lastSync: "2 min ago", port: "4370", protocol: "TCP" },
  { id: "2", name: "Back Gate", ip: "192.168.1.202", model: "ZKTeco ProFace X", status: "online", lastSync: "5 min ago", port: "4370", protocol: "TCP" },
  { id: "3", name: "Parking", ip: "192.168.1.203", model: "ZKTeco MultiBio 800", status: "offline", lastSync: "3h ago", port: "4370", protocol: "TCP" },
];

const deviceModels = [
  "ZKTeco SpeedFace-V5L", "ZKTeco ProFace X", "ZKTeco MultiBio 800",
  "ZKTeco ZFace-M", "ZKTeco uFace 800", "ZKTeco iClock 9000-G"
];

export default function Attendance() {
  const { isHR } = useRole();
  const [syncing, setSyncing] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [addDeviceDialog, setAddDeviceDialog] = useState(false);
  const [devices] = useState(initialDevices);

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
          {isHR && (
            <Dialog open={configDialog} onOpenChange={setConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 press-effect">
                  <Settings2 className="w-3.5 h-3.5" />
                  Device Config
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ZKTeco Device Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* ZKBioAccess API Settings */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3">ZKBioAccess API Connection</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">API Base URL</label>
                        <Input defaultValue="https://zkbio.company.com/api" className="h-8 text-xs font-mono-data" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">API Key</label>
                        <Input defaultValue="••••••••••••" type="password" className="h-8 text-xs font-mono-data" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Sync Interval</label>
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
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Connection Status</label>
                        <div className="flex items-center gap-2 h-8">
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <span className="text-xs text-success font-medium">Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">Registered Devices</h4>
                      <Dialog open={addDeviceDialog} onOpenChange={setAddDeviceDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                            <Plus className="w-3 h-3" /> Add Device
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>Add New Device</DialogTitle></DialogHeader>
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Device Name</label>
                              <Input placeholder="e.g., Floor 2 Entrance" className="h-8 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">IP Address</label>
                                <Input placeholder="192.168.1.xxx" className="h-8 text-xs font-mono-data" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Port</label>
                                <Input placeholder="4370" defaultValue="4370" className="h-8 text-xs font-mono-data" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Model</label>
                              <Select>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select model" /></SelectTrigger>
                                <SelectContent>
                                  {deviceModels.map((m) => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Protocol</label>
                              <Select defaultValue="TCP">
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TCP">TCP/IP</SelectItem>
                                  <SelectItem value="UDP">UDP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <Button variant="outline" size="sm" onClick={() => setAddDeviceDialog(false)}>Cancel</Button>
                              <Button size="sm" onClick={() => setAddDeviceDialog(false)}>Add Device</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            {device.status === "online" ? (
                              <Wifi className="w-4 h-4 text-success" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-destructive" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{device.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono-data">{device.ip}:{device.port} · {device.model}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`status-pill ${device.status === "online" ? "status-active" : "status-resigned"}`}>
                              {device.status}
                            </span>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setConfigDialog(false)}>Cancel</Button>
                    <Button size="sm" className="gap-1.5" onClick={() => setConfigDialog(false)}>
                      <Save className="w-3.5 h-3.5" /> Save Configuration
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Device Status Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {devices.map((device) => (
          <div key={device.ip} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {device.status === "online" ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                <span className="text-sm font-medium">{device.name}</span>
              </div>
              <span className={`status-pill ${device.status === "online" ? "status-active" : "status-resigned"}`}>{device.status}</span>
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
