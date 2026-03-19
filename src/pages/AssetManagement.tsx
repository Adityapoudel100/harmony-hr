import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, Filter, MoreHorizontal, Laptop, Monitor,
  Smartphone, Keyboard, HardDrive, Headphones, Edit2, Trash2, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0, 0, 1] } } };

type AssetStatus = "Assigned" | "Available" | "Under Maintenance" | "Retired" | "Pending Approval";

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedTo: string | null;
  assignedToId: string | null;
  department: string | null;
  purchaseDate: string;
  status: AssetStatus;
  condition: "Good" | "Fair" | "Needs Repair";
}

const statusClass: Record<AssetStatus, string> = {
  Assigned: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Available: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Under Maintenance": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Retired: "bg-muted text-muted-foreground border-border",
  "Pending Approval": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const conditionClass: Record<string, string> = {
  Good: "bg-emerald-500/10 text-emerald-500",
  Fair: "bg-amber-500/10 text-amber-500",
  "Needs Repair": "bg-red-500/10 text-red-500",
};

const typeIcons: Record<string, React.ElementType> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Mobile: Smartphone,
  Keyboard: Keyboard,
  "Hard Drive": HardDrive,
  Headset: Headphones,
};

const assets: Asset[] = [
  { id: "AST-001", name: "MacBook Pro 14\"", type: "Laptop", serialNumber: "MBP-2023-0041", assignedTo: "Aarav Bhandari", assignedToId: "EMP-1001", department: "Engineering", purchaseDate: "2023-01-10", status: "Assigned", condition: "Good" },
  { id: "AST-002", name: "Dell Monitor 27\"", type: "Monitor", serialNumber: "DM-2023-0112", assignedTo: "Aarav Bhandari", assignedToId: "EMP-1001", department: "Engineering", purchaseDate: "2023-01-10", status: "Assigned", condition: "Good" },
  { id: "AST-003", name: "Logitech MX Keys", type: "Keyboard", serialNumber: "LMK-2023-0089", assignedTo: "Aarav Bhandari", assignedToId: "EMP-1001", department: "Engineering", purchaseDate: "2023-01-10", status: "Assigned", condition: "Good" },
  { id: "AST-004", name: "iPhone 15", type: "Mobile", serialNumber: "IP15-2024-0022", assignedTo: null, assignedToId: null, department: null, purchaseDate: "2024-03-01", status: "Pending Approval", condition: "Good" },
  { id: "AST-005", name: "Dell Latitude 15", type: "Laptop", serialNumber: "DL-2022-0203", assignedTo: "Priya Sharma", assignedToId: "EMP-1002", department: "Engineering", purchaseDate: "2022-05-15", status: "Assigned", condition: "Fair" },
  { id: "AST-006", name: "LG Monitor 24\"", type: "Monitor", serialNumber: "LG-2022-0088", assignedTo: null, assignedToId: null, department: null, purchaseDate: "2022-05-15", status: "Available", condition: "Good" },
  { id: "AST-007", name: "Jabra Headset", type: "Headset", serialNumber: "JH-2023-0044", assignedTo: "Manisha Rai", assignedToId: "EMP-1008", department: "Design", purchaseDate: "2023-05-22", status: "Assigned", condition: "Good" },
  { id: "AST-008", name: "ThinkPad X1 Carbon", type: "Laptop", serialNumber: "TP-2021-0099", assignedTo: null, assignedToId: null, department: null, purchaseDate: "2021-03-10", status: "Under Maintenance", condition: "Needs Repair" },
  { id: "AST-009", name: "Samsung Monitor 32\"", type: "Monitor", serialNumber: "SM-2020-0010", assignedTo: null, assignedToId: null, department: null, purchaseDate: "2020-08-01", status: "Retired", condition: "Fair" },
  { id: "AST-010", name: "Seagate 2TB", type: "Hard Drive", serialNumber: "SG-2023-0015", assignedTo: "Dipesh Karki", assignedToId: "EMP-1007", department: "Engineering", purchaseDate: "2023-07-12", status: "Assigned", condition: "Good" },
];

const summaryStats = [
  { label: "Total Assets", value: assets.length, color: "text-foreground" },
  { label: "Assigned", value: assets.filter((a) => a.status === "Assigned").length, color: "text-emerald-500" },
  { label: "Available", value: assets.filter((a) => a.status === "Available").length, color: "text-blue-500" },
  { label: "Maintenance", value: assets.filter((a) => a.status === "Under Maintenance").length, color: "text-amber-500" },
];

export default function AssetManagement() {
  const [search, setSearch] = useState("");

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (a.assignedTo && a.assignedTo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Asset Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage company assets</p>
        </div>
        <Button size="sm" className="gap-1.5 press-effect">
          <Plus className="w-3.5 h-3.5" />
          Add Asset
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, serial, assignee…"
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
              <th>Asset ID</th>
              <th>Asset</th>
              <th>Serial Number</th>
              <th>Assigned To</th>
              <th>Department</th>
              <th>Condition</th>
              <th>Status</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => {
              const Icon = typeIcons[asset.type] || Package;
              return (
                <tr key={asset.id} className="cursor-pointer">
                  <td className="font-mono text-xs text-muted-foreground">{asset.id}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{asset.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{asset.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{asset.serialNumber}</td>
                  <td>
                    {asset.assignedTo ? (
                      <div>
                        <p className="text-sm">{asset.assignedTo}</p>
                        <p className="text-xs text-muted-foreground font-mono">{asset.assignedToId}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-sm text-muted-foreground">{asset.department || "—"}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${conditionClass[asset.condition]}`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClass[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <button className="p-1 rounded hover:bg-accent transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
