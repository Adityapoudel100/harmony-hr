import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, AlertTriangle,
  UserPlus, ArrowUpRight, Activity, Calendar as CalendarIcon, Cake
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useRole } from "@/contexts/RoleContext";
import { EMPLOYEES } from "@/data/mock-data";
import { useSortable } from "@/hooks/use-sortable";
import { SortableTh } from "@/components/SortableTh";

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

const todayLeaves = [
  { name: "Raj Thapa", type: "Paid Leave", dept: "Marketing", from: "Jan 20", to: "Jan 22" },
  { name: "Manisha Rai", type: "Sick Leave", dept: "Design", from: "Jan 15", to: "Jan 15" },
  { name: "Suresh Tamang", type: "Unpaid Leave", dept: "Engineering", from: "Jan 14", to: "Jan 16" },
];

const upcomingHolidays = [
  { date: "2024-01-26", name: "Republic Day" },
  { date: "2024-02-19", name: "Democracy Day" },
  { date: "2024-03-08", name: "Women's Day" },
  { date: "2024-03-25", name: "Holi" },
  { date: "2024-04-14", name: "New Year (Baisakh 1)" },
];

const leaveStatusClass: Record<string, string> = {
  "Paid Leave": "status-active",
  "Sick Leave": "status-pending",
  "Unpaid Leave": "status-notice",
};

export default function Dashboard() {
  const { isHR } = useRole();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  // Dates that have holidays or leaves (for calendar highlighting)
  const holidayDates = upcomingHolidays.map(h => new Date(h.date));

  // Upcoming birthdays — visible to all roles
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return EMPLOYEES
      .filter(e => e.dob && e.status !== "Resigned" && e.status !== "Inactive")
      .map(e => {
        const dob = new Date(e.dob as string);
        const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (next < today) next.setFullYear(today.getFullYear() + 1);
        const daysAway = Math.round((next.getTime() - today.getTime()) / 86400000);
        const turning = next.getFullYear() - dob.getFullYear();
        return { id: e.id, name: e.name, department: e.department, dob: e.dob as string, next, daysAway, turning };
      })
      .sort((a, b) => a.daysAway - b.daysAway)
      .slice(0, 6);
  }, []);

  const { sorted: sortedPending, sort: pendingSort, toggle: togglePending } =
    useSortable<typeof pendingActions[number], "id" | "name" | "action" | "dept" | "time">(pendingActions);

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

      {/* Today's Leave & Upcoming Holidays */}
      <div className="grid grid-cols-3 gap-5">
        {/* Today's Leave */}
        <motion.div variants={item} className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">On Leave Today</h2>
            </div>
            <span className="status-pill status-pending">{todayLeaves.length}</span>
          </div>
          <div className="p-2">
            {todayLeaves.map((l, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                    {l.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">{l.dept} · {l.from} – {l.to}</p>
                  </div>
                </div>
                <span className={`status-pill ${leaveStatusClass[l.type] || "status-pending"}`}>{l.type}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Holidays */}
        <motion.div variants={item} className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Upcoming Holidays</h2>
            </div>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {showCalendar ? "List View" : "Calendar View"}
            </button>
          </div>
          {showCalendar ? (
            <div className="p-3 flex justify-center">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                modifiers={{ holiday: holidayDates }}
                modifiersClassNames={{ holiday: "bg-primary/20 text-primary font-bold rounded-full" }}
              />
            </div>
          ) : (
            <div className="p-2">
              {upcomingHolidays.map((h) => (
                <div key={h.date} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-primary leading-none">
                      {new Date(h.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-primary leading-none mt-0.5">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground font-mono-data">{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Pending Actions Table */}
      {isHR && (
        <motion.div variants={item} className="glass-card overflow-hidden">
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
      )}
    </motion.div>
  );
}
