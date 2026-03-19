import { motion } from "framer-motion";
import { User, FileText, CreditCard, CalendarDays, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const profile = {
  id: "EMP-1001",
  name: "Aarav Bhandari",
  email: "aarav@nexus.io",
  phone: "+977-9812345678",
  department: "Engineering",
  designation: "Sr. Developer",
  dob: "1995-03-15",
  gender: "Male",
  joinDate: "2023-01-15",
  status: "Active",
};

const leaveBalance = [
  { type: "Paid Leave", total: 12, used: 3, remaining: 9 },
  { type: "Sick Leave", total: 6, used: 1, remaining: 5 },
  { type: "Unpaid Leave", total: "∞", used: 0, remaining: "∞" },
];

export default function EmployeeSelfService() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Employee Self-Service Portal</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {/* Profile Card */}
        <motion.div variants={item} className="col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground">
                AB
              </div>
              <div>
                <h2 className="font-semibold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.designation} · {profile.department}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 press-effect">
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Employee ID", value: profile.id, mono: true },
              { label: "Email", value: profile.email },
              { label: "Phone", value: profile.phone, mono: true },
              { label: "Date of Birth", value: profile.dob, mono: true },
              { label: "Gender", value: profile.gender },
              { label: "Date of Joining", value: profile.joinDate, mono: true },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                <p className={`text-sm ${field.mono ? "font-mono-data" : ""}`}>{field.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leave Balance */}
        <motion.div variants={item} className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Leave Balance</h2>
          </div>
          <div className="p-4 space-y-3">
            {leaveBalance.map((lb) => (
              <div key={lb.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{lb.type}</span>
                  <span className="text-xs font-mono-data">{lb.used}/{lb.total === "∞" ? "∞" : lb.total}</span>
                </div>
                {typeof lb.total === "number" && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(lb.used / lb.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <Button size="sm" className="w-full gap-1.5 press-effect">
              <CalendarDays className="w-3.5 h-3.5" />
              Apply Leave
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
