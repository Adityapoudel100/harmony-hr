import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0, 0, 1] } },
};

type EmployeeStatus = "Active" | "Onboarding" | "On Leave" | "Resigned" | "Inactive";

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
  "On Leave": "status-inactive",
  Resigned: "status-resigned",
  Inactive: "status-inactive",
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
  { id: "EMP-1009", name: "Suresh Tamang", email: "suresh@nexus.io", department: "Engineering", designation: "Backend Dev", status: "Active", joinDate: "2022-09-14", type: "Full-time" },
  { id: "EMP-1010", name: "Kavita Shrestha", email: "kavita@nexus.io", department: "Support", designation: "Support Lead", status: "Active", joinDate: "2023-02-28", type: "Full-time" },
];

export default function EmployeeList() {
  const [search, setSearch] = useState("");

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono-data">{employees.length}</span> total employees
          </p>
        </div>
        <Button size="sm" className="gap-1.5 press-effect">
          <Plus className="w-3.5 h-3.5" />
          Add Employee
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm bg-card border-border"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-muted-foreground press-effect">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>
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
              <tr key={emp.id} className="cursor-pointer">
                <td className="font-mono-data text-xs text-muted-foreground">{emp.id}</td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
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
                <td>
                  <button className="p-1 rounded hover:bg-accent transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
