import { motion } from "framer-motion";
import {
  Users, CalendarDays, AlertTriangle,
  UserPlus, ArrowUpRight, Activity
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0, 1] } },
};

const stats = [
  { label: "Active Employees", value: "342", icon: Users, change: "+12", positive: true },
  { label: "Pending Onboarding", value: "12", icon: UserPlus, change: "+3", positive: false },
  { label: "On Leave Today", value: "8", icon: CalendarDays, change: "—", positive: true },
  { label: "Clearance Required", value: "4", icon: AlertTriangle, change: "+1", positive: false },
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
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your workforce status
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 press-effect cursor-default group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              {stat.change !== "—" && (
                <span className={`flex items-center gap-0.5 text-xs font-medium font-mono-data ${stat.positive ? "text-success" : "text-warning"}`}>
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-3xl font-bold font-mono-data tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-5">
        {/* Pending Actions */}
        <motion.div variants={item} className="col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Pending Actions</h2>
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
        <motion.div variants={item} className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Live Activity</h2>
          </div>
          <div className="p-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="relative mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    act.type === "clockin" ? "bg-success animate-pulse-glow" :
                    act.type === "leave" ? "bg-primary" :
                    act.type === "new" ? "bg-primary" :
                    "bg-destructive"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{act.text}</p>
                  <p className="text-[11px] text-muted-foreground font-mono-data mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
