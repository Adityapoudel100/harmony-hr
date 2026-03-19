import { NavLink, useLocation } from "react-router-dom";
import {
  Users, Clock, CalendarDays, LayoutDashboard,
  FileText, LogOut, BarChart3, Shield,
  Settings, Sun, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
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
    items: [{ to: "/ess", icon: FileText, label: "My Profile" }],
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
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-foreground text-[15px]">Cubit HRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-semibold px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/70"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/70 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-sidebar-accent/70 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">Super Admin</p>
            <p className="text-[11px] text-muted-foreground truncate">admin@cubit.io</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
