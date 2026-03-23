import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, ArrowLeft, Clock, User, FileText, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
  reason: string;
  appliedOn: string;
  approvedBy?: string;
  remarks?: string;
  rejectionReason?: string;
}

const initialRequests: LeaveRequest[] = [
  { id: "LV-201", employee: "Raj Thapa", type: "Paid Leave", from: "2024-01-20", to: "2024-01-22", days: 3, status: "Pending", reason: "Family function in hometown", appliedOn: "2024-01-18" },
  { id: "LV-200", employee: "Sita Magar", type: "Sick Leave", from: "2024-01-18", to: "2024-01-18", days: 1, status: "Approved", reason: "Flu and fever", appliedOn: "2024-01-17", approvedBy: "HR Admin", remarks: "Get well soon" },
  { id: "LV-199", employee: "Dipesh Karki", type: "Unpaid Leave", from: "2024-01-15", to: "2024-01-16", days: 2, status: "Rejected", reason: "Personal work", appliedOn: "2024-01-14", rejectionReason: "Project deadline approaching, cannot approve" },
  { id: "LV-198", employee: "Aarav Bhandari", type: "Paid Leave", from: "2024-01-10", to: "2024-01-12", days: 3, status: "Approved", reason: "Vacation trip", appliedOn: "2024-01-05", approvedBy: "HR Admin" },
];

const holidays = [
  { date: "2024-01-26", name: "Republic Day" },
  { date: "2024-02-19", name: "Democracy Day" },
  { date: "2024-03-25", name: "Holi" },
];

const statusClass: Record<string, string> = {
  Pending: "status-pending",
  Approved: "status-active",
  Rejected: "status-resigned",
};

const leaveTypes = ["Paid Leave", "Sick Leave", "Unpaid Leave", "Maternity Leave", "Paternity Leave", "Bereavement Leave"];
const employeeNames = ["Aarav Bhandari", "Priya Sharma", "Raj Thapa", "Sita Magar", "Dipesh Karki", "Bikash Gurung", "Anita KC"];

export default function LeaveManagement() {
  const { isHR } = useRole();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [applyDialog, setApplyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState<LeaveRequest | null>(null);

  // Apply leave form state
  const [newLeave, setNewLeave] = useState({ employee: "", type: "", from: "", to: "", reason: "" });
  const [applyForEmployee, setApplyForEmployee] = useState(false);

  const handleApplyLeave = () => {
    if (!newLeave.type || !newLeave.from || !newLeave.to || !newLeave.reason) return;
    const empName = isHR && applyForEmployee ? newLeave.employee : "Aarav Bhandari";
    if (isHR && applyForEmployee && !newLeave.employee) return;
    const fromDate = new Date(newLeave.from);
    const toDate = new Date(newLeave.to);
    const days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const newReq: LeaveRequest = {
      id: `LV-${202 + requests.length}`,
      employee: empName,
      type: newLeave.type,
      from: newLeave.from,
      to: newLeave.to,
      days,
      status: "Pending",
      reason: newLeave.reason,
      appliedOn: new Date().toISOString().split("T")[0],
    };
    setRequests(prev => [newReq, ...prev]);
    setNewLeave({ employee: "", type: "", from: "", to: "", reason: "" });
    setApplyForEmployee(false);
    setApplyDialog(false);
    toast({ title: "Leave applied", description: `${days} day(s) ${newLeave.type} submitted.` });
  };

  const handleApprove = (req: LeaveRequest) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Approved", approvedBy: "HR Admin" } : r));
    setSelectedRequest(prev => prev ? { ...prev, status: "Approved", approvedBy: "HR Admin" } : null);
    toast({ title: "Leave approved", description: `${req.employee}'s leave has been approved.` });
  };

  const handleReject = () => {
    if (!rejectReason.trim() || !selectedRequest) return;
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "Rejected", rejectionReason: rejectReason } : r));
    setSelectedRequest(prev => prev ? { ...prev, status: "Rejected", rejectionReason: rejectReason } : null);
    setRejectDialog(false);
    setRejectReason("");
    toast({ title: "Leave rejected", description: `${selectedRequest.employee}'s leave has been rejected.` });
  };

  const handleEditLeave = () => {
    if (!editData) return;
    const fromDate = new Date(editData.from);
    const toDate = new Date(editData.to);
    const days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setRequests(prev => prev.map(r => r.id === editData.id ? { ...editData, days } : r));
    if (selectedRequest?.id === editData.id) setSelectedRequest({ ...editData, days });
    setEditDialog(false);
    setEditData(null);
    toast({ title: "Leave updated" });
  };

  const handleDeleteLeave = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    if (selectedRequest?.id === id) setSelectedRequest(null);
    toast({ title: "Leave request deleted" });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {selectedRequest ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" onClick={() => setSelectedRequest(null)}>
            <ArrowLeft className="w-4 h-4" />Back to Leave Requests
          </Button>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold">Leave Request {selectedRequest.id}</h2>
                  <span className={`status-pill ${statusClass[selectedRequest.status]}`}>{selectedRequest.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">Submitted by {selectedRequest.employee}</p>
              </div>
              {isHR && (
                <div className="flex gap-2">
                  {selectedRequest.status === "Pending" && (
                    <>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => { setRejectDialog(true); }}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(selectedRequest)}>Approve</Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => { setEditData({ ...selectedRequest }); setEditDialog(true); }}>
                    <Edit2 className="w-3 h-3" />Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteLeave(selectedRequest.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Employee</p><p className="text-sm font-medium">{selectedRequest.employee}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Leave Type</p><p className="text-sm font-medium">{selectedRequest.type}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium font-mono-data">{selectedRequest.from} → {selectedRequest.to}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedRequest.days} day(s)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg"><p className="text-xs text-muted-foreground mb-1">Reason</p><p className="text-sm">{selectedRequest.reason}</p></div>
                <div className="p-3 bg-muted/30 rounded-lg"><p className="text-xs text-muted-foreground mb-1">Applied On</p><p className="text-sm font-mono-data">{selectedRequest.appliedOn}</p></div>
                {selectedRequest.approvedBy && (
                  <div className="p-3 bg-muted/30 rounded-lg"><p className="text-xs text-muted-foreground mb-1">Processed By</p><p className="text-sm">{selectedRequest.approvedBy}</p></div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-xs text-destructive mb-1">Rejection Reason</p>
                    <p className="text-sm">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-3">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm">Leave applied by <span className="font-medium">{selectedRequest.employee}</span></p>
                  <span className="text-xs text-muted-foreground font-mono-data ml-auto">{selectedRequest.appliedOn}</span>
                </div>
                {selectedRequest.status !== "Pending" && (
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedRequest.status === "Approved" ? "bg-success" : "bg-destructive"}`} />
                    <p className="text-sm">
                      Leave <span className="font-medium">{selectedRequest.status.toLowerCase()}</span>
                      {selectedRequest.approvedBy && <> by <span className="font-medium">{selectedRequest.approvedBy}</span></>}
                    </p>
                    <span className="text-xs text-muted-foreground font-mono-data ml-auto">{selectedRequest.appliedOn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Leave Management</h1>
              <p className="text-sm text-muted-foreground">Manage leave requests and holiday calendar</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 press-effect"><Plus className="w-3.5 h-3.5" />Apply Leave</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>{isHR ? "Apply Leave" : "Apply for Leave"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    {isHR && (
                      <div>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <input type="checkbox" checked={applyForEmployee} onChange={(e) => setApplyForEmployee(e.target.checked)} className="rounded" />
                          Apply on behalf of an employee
                        </label>
                        {applyForEmployee && (
                          <Select value={newLeave.employee} onValueChange={(v) => setNewLeave({ ...newLeave, employee: v })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select employee" /></SelectTrigger>
                            <SelectContent>
                              {employeeNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Leave Type *</label>
                      <Select value={newLeave.type} onValueChange={(v) => setNewLeave({ ...newLeave, type: v })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                        <SelectContent>{leaveTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground mb-1 block">From Date *</label><Input type="date" value={newLeave.from} onChange={(e) => setNewLeave({ ...newLeave, from: e.target.value })} className="h-9 text-sm" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">To Date *</label><Input type="date" value={newLeave.to} onChange={(e) => setNewLeave({ ...newLeave, to: e.target.value })} className="h-9 text-sm" /></div>
                    </div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Reason *</label><Textarea value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Provide a reason..." className="text-sm min-h-[80px]" /></div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => setApplyDialog(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleApplyLeave}>Submit Request</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            <motion.div variants={item} className="col-span-2 bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-medium">Recent Requests</h2></div>
              <table className="nexus-table">
                <thead>
                  <tr><th>ID</th><th>Employee</th><th>Type</th><th>Duration</th><th>Days</th><th>Status</th>{isHR && <th className="w-20">Actions</th>}</tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="cursor-pointer" onClick={() => setSelectedRequest(req)}>
                      <td className="font-mono-data text-xs text-muted-foreground">{req.id}</td>
                      <td className="text-sm font-medium">{req.employee}</td>
                      <td className="text-sm text-muted-foreground">{req.type}</td>
                      <td className="font-mono-data text-xs text-muted-foreground">{req.from} → {req.to}</td>
                      <td className="font-mono-data text-xs">{req.days}</td>
                      <td><span className={`status-pill ${statusClass[req.status]}`}>{req.status}</span></td>
                      {isHR && (
                        <td onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => { setEditData({ ...req }); setEditDialog(true); }}><Edit2 className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => handleDeleteLeave(req.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div variants={item} className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-medium">Upcoming Holidays</h2></div>
              <div className="p-2">
                {holidays.map(h => (
                  <div key={h.date} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <div><p className="text-sm font-medium">{h.name}</p><p className="text-xs text-muted-foreground font-mono-data">{h.date}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reject Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Please provide a reason for rejecting <span className="font-medium text-foreground">{selectedRequest?.employee}</span>'s leave request.</p>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Rejection Reason *</label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter the reason for rejection..." className="text-sm min-h-[100px]" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setRejectDialog(false); setRejectReason(""); }}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Reject Leave</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Leave Request</DialogTitle></DialogHeader>
          {editData && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Employee</label>
                <Input value={editData.employee} onChange={(e) => setEditData({ ...editData, employee: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Leave Type</label>
                <Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{leaveTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">From</label><Input type="date" value={editData.from} onChange={(e) => setEditData({ ...editData, from: e.target.value })} className="h-9 text-sm" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">To</label><Input type="date" value={editData.to} onChange={(e) => setEditData({ ...editData, to: e.target.value })} className="h-9 text-sm" /></div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Reason</label><Textarea value={editData.reason} onChange={(e) => setEditData({ ...editData, reason: e.target.value })} className="text-sm min-h-[60px]" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditDialog(false)}>Cancel</Button>
                <Button size="sm" onClick={handleEditLeave}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
