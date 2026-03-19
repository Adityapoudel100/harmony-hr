import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, ArrowLeft, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";

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
}

const leaveRequests: LeaveRequest[] = [
  { id: "LV-201", employee: "Raj Thapa", type: "Paid Leave", from: "2024-01-20", to: "2024-01-22", days: 3, status: "Pending", reason: "Family function in hometown", appliedOn: "2024-01-18" },
  { id: "LV-200", employee: "Sita Magar", type: "Sick Leave", from: "2024-01-18", to: "2024-01-18", days: 1, status: "Approved", reason: "Flu and fever", appliedOn: "2024-01-17", approvedBy: "HR Admin", remarks: "Get well soon" },
  { id: "LV-199", employee: "Dipesh Karki", type: "Unpaid Leave", from: "2024-01-15", to: "2024-01-16", days: 2, status: "Rejected", reason: "Personal work", appliedOn: "2024-01-14", remarks: "Project deadline approaching, cannot approve" },
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

export default function LeaveManagement() {
  const { isHR } = useRole();
  const [applyDialog, setApplyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Detail View */}
      {selectedRequest ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" onClick={() => setSelectedRequest(null)}>
            <ArrowLeft className="w-4 h-4" />
            Back to Leave Requests
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
              {isHR && selectedRequest.status === "Pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="text-sm font-medium">{selectedRequest.employee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Leave Type</p>
                    <p className="text-sm font-medium">{selectedRequest.type}</p>
                  </div>
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
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Applied On</p>
                  <p className="text-sm font-mono-data">{selectedRequest.appliedOn}</p>
                </div>
                {selectedRequest.approvedBy && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Processed By</p>
                    <p className="text-sm">{selectedRequest.approvedBy}</p>
                  </div>
                )}
                {selectedRequest.remarks && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                    <p className="text-sm">{selectedRequest.remarks}</p>
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
        /* List View */
        <>
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Leave Management</h1>
              <p className="text-sm text-muted-foreground">Manage leave requests and holiday calendar</p>
            </div>
            <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 press-effect">
                  <Plus className="w-3.5 h-3.5" />
                  Apply Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Leave Type *</label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">From Date *</label>
                      <Input type="date" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">To Date *</label>
                      <Input type="date" className="h-9 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Reason *</label>
                    <Textarea placeholder="Provide a reason for your leave request..." className="text-sm min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Supporting Document (optional)</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setApplyDialog(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => setApplyDialog(false)}>Submit Request</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {/* Leave Requests Table */}
            <motion.div variants={item} className="col-span-2 bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-medium">Recent Requests</h2>
              </div>
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="cursor-pointer" onClick={() => setSelectedRequest(req)}>
                      <td className="font-mono-data text-xs text-muted-foreground">{req.id}</td>
                      <td className="text-sm font-medium">{req.employee}</td>
                      <td className="text-sm text-muted-foreground">{req.type}</td>
                      <td className="font-mono-data text-xs text-muted-foreground">{req.from} → {req.to}</td>
                      <td className="font-mono-data text-xs">{req.days}</td>
                      <td><span className={`status-pill ${statusClass[req.status]}`}>{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Upcoming Holidays */}
            <motion.div variants={item} className="bg-card border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-medium">Upcoming Holidays</h2>
              </div>
              <div className="p-2">
                {holidays.map((h) => (
                  <div key={h.date} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground font-mono-data">{h.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
