Design system: Purple primary (258 58% 52%), Orange accent (25 95% 53%), Inter + JetBrains Mono fonts.
Roles: Super Admin, HR/Admin, Employee — role switcher in sidebar footer (demo mode, stored in localStorage).
RoleContext at src/contexts/RoleContext.tsx provides isAdmin, isHR, isEmployee.
Sidebar navigation changes per role. Employee sees only Dashboard, My Profile, Attendance, Leave.
Employee profile page at /employees/:id with tabs: Personal, Documents, Emergency, Bank, Department, Assets.
Status types: Active, On Leave, Notice Period, Resigned, Inactive — with corresponding CSS classes.
Logo: src/assets/logo.png (purple/orange diamond shape).
ZKTeco: ZKBioAccess Web API approach. Device config dialog in Attendance page.
All data is currently mock/static - no backend connected yet.
