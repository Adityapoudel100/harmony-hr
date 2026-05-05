import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, Filter, MoreHorizontal, Laptop, Monitor,
  Smartphone, Keyboard, HardDrive, Headphones, Edit2, Trash2, UserPlus, X, Save, Check,
  Home, Inbox, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0, 0, 1] } } };

type AssetStatus = "Assigned" | "Available" | "Under Maintenance" | "Retired" | "Pending Approval";
type Condition = "Good" | "Fair" | "Needs Repair";

interface Asset {
  id: string; name: string; type: string; serialNumber: string;
  assignedTo: string | null; assignedToId: string | null; department: string | null;
  purchaseDate: string; status: AssetStatus; condition: Condition;
}

const statusClass: Record<AssetStatus, string> = {
  Assigned: "status-active", Available: "bg-primary/10 text-primary border-primary/20",
  "Under Maintenance": "status-pending", Retired: "status-inactive", "Pending Approval": "status-notice",
};
const conditionClass: Record<Condition, string> = {
  Good: "status-active", Fair: "status-pending", "Needs Repair": "status-resigned",
};

const typeIcons: Record<string, React.ElementType> = {
  Laptop, Monitor, Mobile: Smartphone, Keyboard, "Hard Drive": HardDrive, Headset: Headphones,
};
const assetTypes = ["Laptop", "Monitor", "Mobile", "Keyboard", "Hard Drive", "Headset", "Other"];
const employees = [
  { id: "EMP-1001", name: "Aarav Bhandari" }, { id: "EMP-1002", name: "Priya Sharma" },
  { id: "EMP-1007", name: "Dipesh Karki" }, { id: "EMP-1008", name: "Manisha Rai" },
];

const initialAssets: Asset[] = [
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

const TAKEHOME_KEY = "asset_takehome_requests_v1";

interface TakeHomeRequest {
  id: string;
  assetId: string;
  assetName: string;
  empId: string;
  empName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export default function AssetManagement() {
  const { isHR, isEmployee } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<Asset | null>(null);
  const [assignDialog, setAssignDialog] = useState<Asset | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", type: "", serialNumber: "", purchaseDate: "", condition: "Good" as Condition });
  const [assignTo, setAssignTo] = useState("");

  const [takeHomeRequests, setTakeHomeRequests] = useState<TakeHomeRequest[]>([]);
  const [requestDialog, setRequestDialog] = useState<Asset | null>(null);
  const [inboxDialog, setInboxDialog] = useState(false);
  const [reqDraft, setReqDraft] = useState({ reason: "", startDate: new Date().toISOString().slice(0, 10), endDate: "" });

  const myEmpId = useMemo(() => {
    if (!isEmployee) return null;
    const match = employees.find(e => e.name.toLowerCase() === (user?.name || "").toLowerCase());
    return match?.id ?? "EMP-1001";
  }, [isEmployee, user]);

  useEffect(() => {
    const stored = localStorage.getItem(TAKEHOME_KEY);
    if (stored) { try { setTakeHomeRequests(JSON.parse(stored)); } catch { /* ignore */ } }
  }, []);
  useEffect(() => {
    localStorage.setItem(TAKEHOME_KEY, JSON.stringify(takeHomeRequests));
  }, [takeHomeRequests]);

  const myAssignedAssets = useMemo(() => assets.filter(a => a.assignedToId === myEmpId), [assets, myEmpId]);
  const myRequests = useMemo(() => takeHomeRequests.filter(r => r.empId === myEmpId), [takeHomeRequests, myEmpId]);
  const pendingRequests = takeHomeRequests.filter(r => r.status === "Pending");

  const submitTakeHomeRequest = () => {
    if (!requestDialog) return;
    if (!reqDraft.reason.trim() || !reqDraft.startDate || !reqDraft.endDate) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    const req: TakeHomeRequest = {
      id: `THR-${Date.now()}`,
      assetId: requestDialog.id,
      assetName: requestDialog.name,
      empId: myEmpId || "EMP-?",
      empName: user?.name || "Employee",
      reason: reqDraft.reason.trim(),
      startDate: reqDraft.startDate,
      endDate: reqDraft.endDate,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setTakeHomeRequests(prev => [req, ...prev]);
    setRequestDialog(null);
    setReqDraft({ reason: "", startDate: new Date().toISOString().slice(0, 10), endDate: "" });
    toast({ title: "Request submitted", description: "HR/Admin will review your take-home request." });
  };

  const reviewTakeHomeRequest = (id: string, decision: "Approved" | "Rejected") => {
    setTakeHomeRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision, reviewedBy: user?.name || "HR Admin", reviewedAt: new Date().toISOString() } : r));
    toast({ title: `Request ${decision.toLowerCase()}` });
  };

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.serialNumber.toLowerCase().includes(search.toLowerCase()) || (a.assignedTo && a.assignedTo.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const summaryStats = [
    { label: "Total Assets", value: assets.length, color: "text-foreground" },
    { label: "Assigned", value: assets.filter(a => a.status === "Assigned").length, color: "text-success" },
    { label: "Available", value: assets.filter(a => a.status === "Available").length, color: "text-primary" },
    { label: "Maintenance", value: assets.filter(a => a.status === "Under Maintenance").length, color: "text-warning" },
  ];

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.type) return;
    const id = `AST-${String(assets.length + 1).padStart(3, '0')}`;
    setAssets(prev => [...prev, { ...newAsset, id, assignedTo: null, assignedToId: null, department: null, status: "Available" as AssetStatus }]);
    setNewAsset({ name: "", type: "", serialNumber: "", purchaseDate: "", condition: "Good" });
    setAddDialog(false);
    toast({ title: "Asset added", description: `${newAsset.name} added to inventory.` });
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    toast({ title: "Asset removed" });
  };

  const handleAssign = () => {
    if (!assignDialog || !assignTo) return;
    const emp = employees.find(e => e.id === assignTo);
    setAssets(prev => prev.map(a => a.id === assignDialog.id ? { ...a, assignedTo: emp?.name || null, assignedToId: assignTo, status: "Assigned" as AssetStatus } : a));
    setAssignDialog(null); setAssignTo("");
    toast({ title: "Asset assigned" });
  };

  const handleApprove = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: "Assigned" as AssetStatus } : a));
    toast({ title: "Asset approved" });
  };

  const handleChangeStatus = (id: string, status: AssetStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status, ...(status === "Available" ? { assignedTo: null, assignedToId: null, department: null } : {}) } : a));
    toast({ title: `Status changed to ${status}` });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Asset Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage company assets</p>
        </div>
        {isHR && (
          <Dialog open={addDialog} onOpenChange={setAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 press-effect"><Plus className="w-3.5 h-3.5" />Add Asset</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div><label className="text-xs text-muted-foreground mb-1 block">Asset Name *</label><Input value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="h-8 text-sm" placeholder='e.g., MacBook Pro 16"' /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Type *</label>
                    <Select value={newAsset.type} onValueChange={v => setNewAsset({ ...newAsset, type: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{assetTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Serial Number</label><Input value={newAsset.serialNumber} onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })} className="h-8 text-xs font-mono-data" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Purchase Date</label><Input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="h-8 text-xs" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                    <Select value={newAsset.condition} onValueChange={v => setNewAsset({ ...newAsset, condition: v as Condition })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Good", "Fair", "Needs Repair"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setAddDialog(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddAsset}>Add Asset</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        {summaryStats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold font-mono-data ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, serial, assignee…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm bg-card border-border" />
        </div>
        <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-1.5 h-8 text-muted-foreground press-effect" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-3.5 h-3.5" />Filters
        </Button>
        {showFilters && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              {(["Assigned", "Available", "Under Maintenance", "Retired", "Pending Approval"] as AssetStatus[]).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="nexus-table">
          <thead><tr><th>Asset ID</th><th>Asset</th><th>Serial Number</th><th>Assigned To</th><th>Department</th><th>Condition</th><th>Status</th><th className="w-10"></th></tr></thead>
          <tbody>
            {filtered.map(asset => {
              const Icon = typeIcons[asset.type] || Package;
              return (
                <tr key={asset.id}>
                  <td className="font-mono-data text-xs text-muted-foreground">{asset.id}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-muted-foreground" /></div>
                      <div><p className="text-sm font-medium leading-none">{asset.name}</p><p className="text-xs text-muted-foreground mt-0.5">{asset.type}</p></div>
                    </div>
                  </td>
                  <td className="font-mono-data text-xs text-muted-foreground">{asset.serialNumber}</td>
                  <td>{asset.assignedTo ? <div><p className="text-sm">{asset.assignedTo}</p><p className="text-xs text-muted-foreground font-mono-data">{asset.assignedToId}</p></div> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  <td className="text-sm text-muted-foreground">{asset.department || "—"}</td>
                  <td><span className={`status-pill ${conditionClass[asset.condition]}`}>{asset.condition}</span></td>
                  <td><span className={`status-pill ${statusClass[asset.status]}`}>{asset.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    {isHR && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><button className="p-1 rounded hover:bg-accent transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {asset.status === "Available" && <DropdownMenuItem onClick={() => { setAssignDialog(asset); setAssignTo(""); }}>Assign to Employee</DropdownMenuItem>}
                          {asset.status === "Pending Approval" && <DropdownMenuItem onClick={() => handleApprove(asset.id)}>Approve Request</DropdownMenuItem>}
                          {asset.status === "Assigned" && <DropdownMenuItem onClick={() => handleChangeStatus(asset.id, "Available")}>Unassign</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleChangeStatus(asset.id, "Under Maintenance")}>Send to Maintenance</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(asset.id, "Retired")}>Retire Asset</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteAsset(asset.id)}>Delete Asset</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Asset</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm">Assign <span className="font-medium">{assignDialog?.name}</span> to:</p>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.id})</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAssignDialog(null)}>Cancel</Button>
              <Button size="sm" onClick={handleAssign}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
