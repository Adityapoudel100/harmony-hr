import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const leaveRequests = [
  { id: "LV-201", employee: "Raj Thapa", type: "Paid Leave", from: "2024-01-20", to: "2024-01-22", days: 3, status: "Pending" },
  { id: "LV-200", employee: "Sita Magar", type: "Sick Leave", from: "2024-01-18", to: "2024-01-18", days: 1, status: "Approved" },
  { id: "LV-199", employee: "Dipesh Karki", type: "Unpaid Leave", from: "2024-01-15", to: "2024-01-16", days: 2, status: "Rejected" },
  { id: "LV-198", employee: "Aarav Bhandari", type: "Paid Leave", from: "2024-01-10", to: "2024-01-12", days: 3, status: "Approved" },
];

const holidays = [
  { date: "2024-01-26", name: "Republic Day" },
  { date: "2024-02-19", name: "Democracy Day" },
  { date: "2024-03-25", name: "Holi" },
];

const statusClass: Record<string, string> = {
  Pending: "status-pending",
  Approved: "status-active",
  Rejected: "status-resigned",
};

export default function LeaveManagement() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Leave Management</h1>
          <p className="text-sm text-muted-foreground">Manage leave requests and holiday calendar</p>
        </div>
        <Button size="sm" className="gap-1.5 press-effect">
          <Plus className="w-3.5 h-3.5" />
          Apply Leave
        </Button>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {/* Leave Requests Table */}
        <motion.div variants={item} className="col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Recent Requests</h2>
          </div>
          <table className="nexus-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => (
                <tr key={req.id} className="cursor-pointer">
                  <td className="font-mono-data text-xs text-muted-foreground">{req.id}</td>
                  <td className="text-sm font-medium">{req.employee}</td>
                  <td className="text-sm text-muted-foreground">{req.type}</td>
                  <td className="font-mono-data text-xs text-muted-foreground">{req.from} → {req.to}</td>
                  <td className="font-mono-data text-xs">{req.days}</td>
                  <td><span className={`status-pill ${statusClass[req.status]}`}>{req.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Upcoming Holidays */}
        <motion.div variants={item} className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Upcoming Holidays</h2>
          </div>
          <div className="p-2">
            {holidays.map((h) => (
              <div key={h.date} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors">
                <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground font-mono-data">{h.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
