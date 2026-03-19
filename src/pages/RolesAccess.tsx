import { motion } from "framer-motion";
import { Shield, Users, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const roles = [
  {
    name: "Super Admin",
    description: "Full system access. Can manage companies, roles, and all modules.",
    users: 1,
    permissions: ["All Access", "Company Management", "Role Management", "User Management"],
  },
  {
    name: "HR / Admin",
    description: "Can create employees, manage leaves, documents, and assets.",
    users: 3,
    permissions: ["Employee Management", "Leave Approval", "Document Verification", "Asset Management"],
  },
  {
    name: "Employee",
    description: "Self-service access. Can view profile, apply leave, and manage own assets.",
    users: 338,
    permissions: ["View Profile", "Apply Leave", "View Attendance", "Asset Requests"],
  },
];

export default function RolesAccess() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold">Roles & Access</h1>
        <p className="text-sm text-muted-foreground">Manage system roles and permissions</p>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{role.name}</h3>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono-data flex items-center gap-1">
                  <Users className="w-3 h-3" /> {role.users}
                </span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {role.permissions.map((perm) => (
                <span key={perm} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
