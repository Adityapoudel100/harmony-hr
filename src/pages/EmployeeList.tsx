import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, Filter, MoreHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRole } from "@/contexts/RoleContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0, 0, 1] } },
};

type EmployeeStatus = "Active" | "Onboarding" | "On Leave" | "Resigned" | "Inactive" | "Notice Period";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: EmployeeStatus;
  joinDate: string;
  type: string;
}

const statusClass: Record<EmployeeStatus, string> = {
  Active: "status-active",
  Onboarding: "status-pending",
  "On Leave": "status-pending",
  Resigned: "status-resigned",
  Inactive: "status-inactive",
  "Notice Period": "status-notice",
};

const employees: Employee[] = [
  { id: "EMP-1001", name: "Aarav Bhandari", email: "aarav@nexus.io", department: "Engineering", designation: "Sr. Developer", status: "Active", joinDate: "2023-01-15", type: "Full-time" },
  { id: "EMP-1002", name: "Priya Sharma", email: "priya@nexus.io", department: "Engineering", designation: "DevOps Lead", status: "Active", joinDate: "2022-06-01", type: "Full-time" },
  { id: "EMP-1003", name: "Raj Thapa", email: "raj@nexus.io", department: "Marketing", designation: "Campaign Manager", status: "On Leave", joinDate: "2023-03-20", type: "Full-time" },
  { id: "EMP-1004", name: "Sita Magar", email: "sita@nexus.io", department: "HR", designation: "HR Coordinator", status: "Active", joinDate: "2022-11-10", type: "Full-time" },
  { id: "EMP-1005", name: "Bikash Gurung", email: "bikash@nexus.io", department: "Operations", designation: "Ops Manager", status: "Resigned", joinDate: "2021-08-05", type: "Full-time" },
  { id: "EMP-1006", name: "Anita KC", email: "anita@nexus.io", department: "Finance", designation: "Accountant", status: "Onboarding", joinDate: "2024-01-08", type: "Full-time" },
  { id: "EMP-1007", name: "Dipesh Karki", email: "dipesh@nexus.io", department: "Engineering", designation: "Frontend Dev", status: "Active", joinDate: "2023-07-12", type: "Contract" },
  { id: "EMP-1008", name: "Manisha Rai", email: "manisha@nexus.io", department: "Design", designation: "UI Designer", status: "Active", joinDate: "2023-05-22", type: "Full-time" },
  { id: "EMP-1009", name: "Suresh Tamang", email: "suresh@nexus.io", department: "Engineering", designation: "Backend Dev", status: "Notice Period", joinDate: "2022-09-14", type: "Full-time" },
  { id: "EMP-1010", name: "Kavita Shrestha", email: "kavita@nexus.io", department: "Support", designation: "Support Lead", status: "Active", joinDate: "2023-02-28", type: "Full-time" },
];

const departments = [...new Set(employees.map((e) => e.department))];
const statuses: EmployeeStatus[] = ["Active", "Onboarding", "On Leave", "Notice Period", "Resigned", "Inactive"];
const types = ["Full-time", "Contract", "Part-time"];

export default function EmployeeList() {
  const navigate = useNavigate();
  const { isHR } = useRole();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [addDialog, setAddDialog] = useState(false);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || e.department === filterDept;
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const matchType = filterType === "all" || e.type === filterType;
    return matchSearch && matchDept && matchStatus && matchType;
  });

  const hasFilters = filterDept !== "all" || filterStatus !== "all" || filterType !== "all";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono-data">{employees.length}</span> total employees
          </p>
        </div>
        {isHR && (
          <Dialog open={addDialog} onOpenChange={setAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 press-effect">
                <Plus className="w-3.5 h-3.5" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                    <Input placeholder="Enter full name" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                    <Input placeholder="email@company.com" type="email" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                    <Input placeholder="+977-98XXXXXXXX" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                    <Input type="date" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Department *</label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Designation *</label>
                    <Input placeholder="e.g., Sr. Developer" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Employment Type</label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date of Joining</label>
                    <Input type="date" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setAddDialog(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => setAddDialog(false)}>Add Employee</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm bg-card border-border"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5 h-8 text-muted-foreground press-effect"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1" onClick={() => { setFilterDept("all"); setFilterStatus("all"); setFilterType("all"); }}>
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Department:</span>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="nexus-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Type</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="cursor-pointer" onClick={() => navigate(`/employees/${emp.id}`)}>
                <td className="font-mono-data text-xs text-muted-foreground">{emp.id}</td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{emp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm">{emp.department}</td>
                <td className="text-sm text-muted-foreground">{emp.designation}</td>
                <td className="text-xs text-muted-foreground">{emp.type}</td>
                <td>
                  <span className={`status-pill ${statusClass[emp.status]}`}>{emp.status}</span>
                </td>
                <td className="font-mono-data text-xs text-muted-foreground">{emp.joinDate}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}`)}>View Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}`)}>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>View Documents</DropdownMenuItem>
                      <DropdownMenuItem>View Attendance</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                  No employees found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
