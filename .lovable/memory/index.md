# Memory: index.md
Updated: now

Design system: Light/dark theme with Inter font + JetBrains Mono. Primary: 220 90% 56%. Glass-card utility class for cards.
Theme: ThemeProvider with localStorage persistence, toggle in sidebar footer.
Roles: Super Admin, HR/Admin, Employee (not yet implemented with auth).
Modules: Dashboard, Employees, Attendance (ZKTeco ZKBioAccess integration planned), Leave, ESS, Offboarding, Reports, Roles & Access.
ZKTeco: User chose ZKBioAccess Web API approach. Needs Lovable Cloud for edge function to proxy API calls.
All data is currently mock/static - no backend connected yet.
