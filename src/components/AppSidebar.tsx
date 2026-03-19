import { NavLink, useLocation } from "react-router-dom";
import {
  Users, Clock, CalendarDays, LayoutDashboard,
  FileText, LogOut, BarChart3, UserCog, Shield,
  ChevronDown, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/employees", icon: Users, label: "Employees" },
      { to: "/attendance", icon: Clock, label: "Attendance" },
      { to: "/leave", icon: CalendarDays, label: "Leave" },
    ],
  },
  {
    label: "Self-Service",
    items: [
      { to: "/ess", icon: FileText, label: "My Profile" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/offboarding", icon: LogOut, label: "Offboarding" },
      { to: "/reports", icon: BarChart3, label: "Reports" },
      { to: "/roles", icon: Shield, label: "Roles & Access" },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">Nexus HRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-2 mb-1.5">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-accent text-foreground glow-active"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">Super Admin</p>
            <p className="text-[10px] text-muted-foreground truncate">admin@nexus.io</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
