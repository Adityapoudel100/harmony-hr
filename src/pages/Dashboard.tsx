import { motion } from "framer-motion";
import {
  Users, Clock, CalendarDays, AlertTriangle,
  UserPlus, CheckCircle2, TrendingUp, ArrowUpRight
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, ease: [0.2, 0, 0, 1] },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0, 0, 1] } },
};

const stats = [
  { label: "Active Employees", value: "342", icon: Users, change: "+12", status: "active" as const },
  { label: "Pending Onboarding", value: "12", icon: UserPlus, change: "+3", status: "pending" as const },
  { label: "On Leave Today", value: "8", icon: CalendarDays, change: "—", status: "inactive" as const },
  { label: "Clearance Required", value: "4", icon: AlertTriangle, change: "+1", status: "pending" as const },
];

const pendingActions = [
  { id: "EMP-1042", name: "Priya Sharma", action: "Document Verification", dept: "Engineering", time: "2h ago" },
  { id: "EMP-1038", name: "Raj Thapa", action: "Leave Approval", dept: "Marketing", time: "4h ago" },
  { id: "EMP-1045", name: "Anita KC", action: "Onboarding Review", dept: "Finance", time: "5h ago" },
  { id: "EMP-0998", name: "Bikash Gurung", action: "Exit Clearance", dept: "Operations", time: "1d ago" },
  { id: "EMP-1041", name: "Sita Magar", action: "Bank Details Update", dept: "HR", time: "1d ago" },
];

const recentActivity = [
  { text: "Priya Sharma clocked in", time: "08:02 AM", type: "clockin" as const },
  { text: "Leave approved for Raj Thapa", time: "07:45 AM", type: "leave" as const },
  { text: "New employee Anita KC added", time: "Yesterday", type: "new" as const },
  { text: "Bikash Gurung submitted resignation", time: "Yesterday", type: "exit" as const },
];

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold text-foreground">System State</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          <span className="font-mono-data text-foreground font-medium">342</span> Active Nodes · <span className="font-mono-data text-warning font-medium">12</span> Pending Onboarding · <span className="font-mono-data text-warning font-medium">4</span> Clearance Required
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-4 press-effect cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              {stat.change !== "—" && (
                <span className={`text-xs font-mono-data ${stat.status === "active" ? "text-success" : "text-warning"}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold font-mono-data tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending Actions */}
        <motion.div variants={item} className="col-span-2 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Pending Actions</h2>
            <span className="status-pill status-pending">{pendingActions.length} items</span>
          </div>
          <table className="nexus-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Action Required</th>
                <th>Department</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {pendingActions.map((action) => (
                <tr key={action.id} className="cursor-pointer">
                  <td className="font-mono-data text-xs text-muted-foreground">{action.id}</td>
                  <td className="font-medium text-sm">{action.name}</td>
                  <td>
                    <span className="status-pill status-pending">{action.action}</span>
                  </td>
                  <td className="text-muted-foreground text-sm">{action.dept}</td>
                  <td className="font-mono-data text-xs text-muted-foreground">{action.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Live Activity */}
        <motion.div variants={item} className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Live Activity</h2>
          </div>
          <div className="p-2">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-accent/50 transition-colors">
                <div className="relative mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    act.type === "clockin" ? "bg-success animate-pulse-glow" :
                    act.type === "leave" ? "bg-primary" :
                    act.type === "new" ? "bg-primary" :
                    "bg-destructive"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{act.text}</p>
                  <p className="text-xs text-muted-foreground font-mono-data">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
