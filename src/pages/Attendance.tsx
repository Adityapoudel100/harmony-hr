import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight } from "lucide-react";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const todayLog = [
  { id: "EMP-1001", name: "Aarav Bhandari", checkIn: "08:02", checkOut: "—", hours: "6h 12m", status: "Present" },
  { id: "EMP-1002", name: "Priya Sharma", checkIn: "08:15", checkOut: "—", hours: "5h 59m", status: "Present" },
  { id: "EMP-1004", name: "Sita Magar", checkIn: "08:45", checkOut: "—", hours: "5h 29m", status: "Late" },
  { id: "EMP-1007", name: "Dipesh Karki", checkIn: "07:58", checkOut: "—", hours: "6h 16m", status: "Present" },
  { id: "EMP-1009", name: "Suresh Tamang", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
  { id: "EMP-1010", name: "Kavita Shrestha", checkIn: "08:00", checkOut: "16:05", hours: "8h 05m", status: "Complete" },
];

const statusColors: Record<string, string> = {
  Present: "status-active",
  Late: "status-pending",
  Absent: "status-resigned",
  Complete: "status-active",
};

export default function Attendance() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">Today's attendance log · <span className="font-mono-data">Jan 15, 2024</span></p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        {[
          { label: "Present", value: "4", color: "text-success" },
          { label: "Late", value: "1", color: "text-warning" },
          { label: "Absent", value: "1", color: "text-destructive" },
          { label: "On Leave", value: "2", color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className={`text-2xl font-semibold font-mono-data ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium">Daily Log</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                <td><span className={`status-pill ${statusColors[row.status]}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
