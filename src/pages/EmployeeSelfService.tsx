import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, FileText, CreditCard, CalendarDays, Edit2, Upload, Plus,
  Phone, Mail, Building2, Package, AlertCircle, Check, X, Trash2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const profile = {
  id: "EMP-1001", name: "Aarav Bhandari", email: "aarav@nexus.io", phone: "+977-9812345678",
  department: "Engineering", designation: "Sr. Developer", dob: "1995-03-15", gender: "Male",
  joinDate: "2023-01-15", status: "Active", maritalStatus: "Single",
  fatherName: "Ram Bhandari", grandfatherName: "Hari Bhandari", motherName: "Sita Bhandari",
  currentAddress: "Kathmandu, Nepal", permanentAddress: "Pokhara, Nepal",
  level: "Senior", hierarchy: "Team Lead → Engineering Manager → CTO",
  previousExperience: "4 years", employmentType: "Full-time", employmentStatus: "Active",
};

const leaveBalance = [
  { type: "Paid Leave", total: 12, used: 3, remaining: 9 },
  { type: "Sick Leave", total: 6, used: 1, remaining: 5 },
  { type: "Unpaid Leave", total: "∞", used: 0, remaining: "∞" },
];

type DocStatus = "Verified" | "Pending" | "Rejected";
const documents: { id: string; name: string; type: string; uploadedAt: string; status: DocStatus; fileSize: string }[] = [
  { id: "1", name: "Citizenship Certificate", type: "Citizenship", uploadedAt: "2023-01-10", status: "Verified", fileSize: "2.4 MB" },
  { id: "2", name: "PAN Card", type: "PAN", uploadedAt: "2023-01-10", status: "Verified", fileSize: "1.1 MB" },
  { id: "3", name: "Bachelor's Degree", type: "Certificate", uploadedAt: "2023-01-12", status: "Pending", fileSize: "3.8 MB" },
  { id: "4", name: "National ID", type: "National Identification", uploadedAt: "2023-01-12", status: "Verified", fileSize: "1.5 MB" },
  { id: "5", name: "Police Report", type: "Police Report", uploadedAt: "2023-02-01", status: "Pending", fileSize: "0.9 MB" },
  { id: "6", name: "SSF Document", type: "SSF", uploadedAt: "2023-02-05", status: "Verified", fileSize: "1.2 MB" },
];

const emergencyContacts = [
  { id: "1", name: "Ram Bhandari", relation: "Father", phone: "+977-9801234567", email: "ram@email.com" },
  { id: "2", name: "Sita Bhandari", relation: "Mother", phone: "+977-9801234568", email: "sita@email.com" },
];

const bankDetails = {
  bankName: "Nepal Bank Ltd.", accountNumber: "1234567890123456",
  branch: "Kathmandu Main Branch", salaryAmount: "NPR 85,000", contractType: "Permanent",
};

const employeeAssets = [
  { id: "A-001", name: "MacBook Pro 14\"", type: "Laptop", serialNumber: "MBP-2023-0041", assignedDate: "2023-01-15", status: "Active" },
  { id: "A-002", name: "Dell Monitor 27\"", type: "Monitor", serialNumber: "DM-2023-0112", assignedDate: "2023-01-15", status: "Active" },
  { id: "A-003", name: "Logitech MX Keys", type: "Keyboard", serialNumber: "LMK-2023-0089", assignedDate: "2023-01-15", status: "Active" },
  { id: "A-004", name: "iPhone 15", type: "Mobile", serialNumber: "IP15-2024-0022", assignedDate: "2024-03-01", status: "Pending Approval" },
];

const docStatusClass: Record<string, string> = { Verified: "status-active", Pending: "status-pending", Rejected: "status-resigned" };
const assetStatusClass: Record<string, string> = {
  Active: "status-active", "Pending Approval": "status-pending",
  Returned: "status-inactive", "Pending Return": "status-notice",
};

const documentTypes = ["Citizenship", "PAN", "Certificate", "National Identification", "Police Report", "SSF", "Other"];

export default function EmployeeSelfService() {
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [assetRequestDialog, setAssetRequestDialog] = useState(false);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Employee Self-Service Portal</p>
      </motion.div>

      {/* Top Summary */}
      <motion.div variants={item} className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
              AB
            </div>
            <div>
              <h2 className="font-semibold text-base">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.designation} · {profile.department}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-mono-data text-muted-foreground">{profile.id}</span>
                <span className="status-pill status-active">{profile.status}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 press-effect" onClick={() => setEditing(!editing)}>
            {editing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {editing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 border border-border p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <User className="w-3.5 h-3.5" />Personal
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-3.5 h-3.5" />Documents
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Phone className="w-3.5 h-3.5" />Emergency
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CreditCard className="w-3.5 h-3.5" />Bank Details
            </TabsTrigger>
            <TabsTrigger value="department" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Building2 className="w-3.5 h-3.5" />Department
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CalendarDays className="w-3.5 h-3.5" />Leave
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Package className="w-3.5 h-3.5" />Assets
            </TabsTrigger>
          </TabsList>

          {/* Personal Details */}
          <TabsContent value="profile" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone", mono: true },
                  { label: "Date of Birth", key: "dob", mono: true },
                  { label: "Gender", key: "gender" },
                  { label: "Marital Status", key: "maritalStatus" },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                    {editing ? (
                      <Input
                        value={(editData as any)[field.key]}
                        onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className={`text-sm ${field.mono ? "font-mono-data" : ""}`}>{(profile as any)[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Family Details</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Father's Name", key: "fatherName" },
                  { label: "Grandfather's Name", key: "grandfatherName" },
                  { label: "Mother's Name", key: "motherName" },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                    {editing ? (
                      <Input value={(editData as any)[field.key]} onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })} className="h-8 text-sm" />
                    ) : (
                      <p className="text-sm">{(profile as any)[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Current Address", key: "currentAddress" },
                  { label: "Permanent Address", key: "permanentAddress" },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                    {editing ? (
                      <Input value={(editData as any)[field.key]} onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })} className="h-8 text-sm" />
                    ) : (
                      <p className="text-sm">{(profile as any)[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <div className="bg-card border border-border rounded-lg">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Documents</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload citizenship, PAN, certificates, NID, police report, SSF</p>
                </div>
                <Button size="sm" className="gap-1.5 press-effect"><Upload className="w-3.5 h-3.5" />Upload Document</Button>
              </div>
              <div className="px-5 py-4 border-b border-border">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                  <div className="flex items-center gap-2 justify-center mt-3">
                    <Select>
                      <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Select document type" /></SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <table className="nexus-table">
                <thead><tr><th>Document</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Status</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm">{doc.name}</span></div></td>
                      <td className="text-xs text-muted-foreground">{doc.type}</td>
                      <td className="text-xs font-mono-data text-muted-foreground">{doc.fileSize}</td>
                      <td className="text-xs font-mono-data text-muted-foreground">{doc.uploadedAt}</td>
                      <td>
                        <span className={`status-pill ${docStatusClass[doc.status]}`}>
                          {doc.status === "Verified" && <Check className="w-3 h-3 mr-1" />}
                          {doc.status === "Pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {doc.status === "Rejected" && <X className="w-3 h-3 mr-1" />}
                          {doc.status}
                        </span>
                      </td>
                      <td><button className="p-1 rounded hover:bg-muted transition-colors"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Emergency Contacts */}
          <TabsContent value="emergency" className="space-y-4">
            <div className="bg-card border border-border rounded-lg">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Emergency Contacts</h3>
                <Button size="sm" variant="outline" className="gap-1.5 press-effect"><Plus className="w-3.5 h-3.5" />Add Contact</Button>
              </div>
              <div className="divide-y divide-border">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {contact.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" /><span className="font-mono-data">{contact.phone}</span></div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3.5 h-3.5" /><span>{contact.email}</span></div>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Edit2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bank Details */}
          <TabsContent value="bank" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Bank & Salary Information</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Bank Name", value: bankDetails.bankName },
                  { label: "Account Number", value: bankDetails.accountNumber, mono: true },
                  { label: "Branch", value: bankDetails.branch },
                  { label: "Salary Amount", value: bankDetails.salaryAmount, mono: true },
                  { label: "Employment Contract", value: bankDetails.contractType },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                    <p className={`text-sm ${field.mono ? "font-mono-data" : ""}`}>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Department & Role */}
          <TabsContent value="department" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Department & Role Assignment</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Department", value: profile.department },
                  { label: "Designation", value: profile.designation },
                  { label: "Level", value: profile.level },
                  { label: "Hierarchy", value: profile.hierarchy },
                  { label: "Date of Joining", value: profile.joinDate, mono: true },
                  { label: "Previous Experience", value: profile.previousExperience },
                  { label: "Employment Type", value: profile.employmentType },
                  { label: "Employment Status", value: profile.employmentStatus },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                    <p className={`text-sm ${field.mono ? "font-mono-data" : ""}`}>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Leave Balance */}
          <TabsContent value="leave" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {leaveBalance.map((lb) => (
                <div key={lb.type} className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{lb.type}</p>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-semibold font-mono-data">{lb.remaining}</span>
                    <span className="text-xs text-muted-foreground font-mono-data">{lb.used}/{lb.total === "∞" ? "∞" : lb.total} used</span>
                  </div>
                  {typeof lb.total === "number" && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(lb.used / lb.total) * 100}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              <Button size="sm" className="gap-1.5 press-effect">
                <CalendarDays className="w-3.5 h-3.5" />
                Apply Leave
              </Button>
            </div>
          </TabsContent>

          {/* Assets */}
          <TabsContent value="assets" className="space-y-4">
            <div className="bg-card border border-border rounded-lg">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">My Assets</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Assets allocated to you. Request additions or returns below.</p>
                </div>
                <Dialog open={assetRequestDialog} onOpenChange={setAssetRequestDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 press-effect"><Plus className="w-3.5 h-3.5" />Request Asset</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Request New Asset</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Asset Type</label>
                        <Select>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {["Laptop", "Monitor", "Keyboard", "Mouse", "Mobile", "Headset", "Other"].map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Asset Name / Description</label>
                        <Input placeholder="e.g., MacBook Pro 16 inch" className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Reason for Request</label>
                        <Textarea placeholder="Why do you need this asset?" className="text-sm min-h-[80px]" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAssetRequestDialog(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => setAssetRequestDialog(false)}>Submit Request</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <table className="nexus-table">
                <thead><tr><th>Asset ID</th><th>Name</th><th>Type</th><th>Serial Number</th><th>Assigned</th><th>Status</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {employeeAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="text-xs font-mono-data text-muted-foreground">{asset.id}</td>
                      <td className="text-sm font-medium">{asset.name}</td>
                      <td className="text-xs text-muted-foreground">{asset.type}</td>
                      <td className="text-xs font-mono-data text-muted-foreground">{asset.serialNumber}</td>
                      <td className="text-xs font-mono-data text-muted-foreground">{asset.assignedDate}</td>
                      <td><span className={`status-pill ${assetStatusClass[asset.status]}`}>{asset.status}</span></td>
                      <td>
                        {asset.status === "Active" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">Return</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
