// ===== Cubit HRM — Centralized Type Definitions =====
// All shared interfaces/types live here for backend integration readiness.

// ──── Common ────
export type UUID = string;

// ──── Employee ────
export type EmployeeStatus = "Active" | "Onboarding" | "On Leave" | "Resigned" | "Inactive" | "Notice Period";
export type EmploymentType = "Full-time" | "Contract" | "Part-time";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  department: string;
  designation: string;
  status: EmployeeStatus;
  joinDate: string;
  type: EmploymentType;
  maritalStatus?: string;
  fatherName?: string;
  grandfatherName?: string;
  motherName?: string;
  currentAddress?: string;
  permanentAddress?: string;
  level?: string;
  hierarchy?: string;
  previousExperience?: string;
  employmentStatus?: string;
}

// ──── Documents ────
export type DocStatus = "Verified" | "Pending" | "Rejected";
export type DocumentType = "Citizenship" | "PAN" | "Certificate" | "National Identification" | "Police Report" | "SSF" | "Other";

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: DocumentType;
  uploadedAt: string;
  status: DocStatus;
  fileSize: string;
  fileUrl?: string;
}

// ──── Emergency Contact ────
export interface EmergencyContact {
  id: string;
  employeeId: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
}

// ──── Bank Details ────
export interface BankDetails {
  id?: string;
  employeeId: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  salaryAmount: string;
  contractType: string;
}

// ──── Attendance ────
export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: "Present" | "Late" | "Absent" | "Complete" | "On Leave";
  source: string;
}

export interface BiometricDevice {
  id: string;
  name: string;
  ip: string;
  port: string;
  model: string;
  protocol: string;
  status: "online" | "offline";
  lastSync: string;
}

// ──── Leave ────
export interface LeaveRequest {
  id: string;
  employeeId?: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  appliedOn: string;
  approvedBy?: string;
  remarks?: string;
  rejectionReason?: string;
}

export type HolidayType = "public" | "restricted" | "optional";
export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
}

export type LeavePolicyType = "paid" | "sick" | "unpaid" | "compensatory" | "custom";
export interface LeavePolicy {
  id: string;
  name: string;
  type: LeavePolicyType;
  annualQuota: number;
  proRata: boolean;
  carryForward: boolean;
  maxCarryForward: number;
  active: boolean;
}

export interface LeaveBalance {
  type: string;
  total: number | "∞";
  used: number;
  remaining: number | "∞";
}

// ──── Asset ────
export type AssetStatus = "Assigned" | "Available" | "Under Maintenance" | "Retired" | "Pending Approval";
export type AssetCondition = "Good" | "Fair" | "Needs Repair";

export interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedTo: string | null;
  assignedToId: string | null;
  department: string | null;
  purchaseDate: string;
  status: AssetStatus;
  condition: AssetCondition;
}

export interface EmployeeAsset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedDate: string;
  status: string;
}

// ──── Offboarding ────
export interface OffboardingCase {
  id: string;
  name: string;
  department: string;
  resignDate: string;
  lastDay: string;
  noticePeriod: string;
  clearance: Record<string, boolean>;
  status: "In Progress" | "Completed";
}

// ──── Roles & Access ────
export type UserRole = "super_admin" | "hr_admin" | "employee";
export type Permission = "view" | "create" | "edit" | "delete";

export const ALL_MODULES = [
  "Dashboard", "Employees", "Attendance", "Leave Management", "Payroll",
  "Assets", "Offboarding", "Reports", "Roles & Access", "Employee Self-Service",
] as const;
export type Module = (typeof ALL_MODULES)[number];
export const ALL_PERMISSIONS: Permission[] = ["view", "create", "edit", "delete"];

export interface RolePermissions {
  [module: string]: Permission[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  maxUsers: number | null;
  permissions: RolePermissions;
  locked: boolean;
}

export interface UserAssignment {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ──── Payroll (re-exports from engine) ────
export type { PayrollEmployee, PayrollResult, TaxpayerType, Gender, FYData, TaxSlab, TaxBandBreakdown } from "@/lib/payroll-engine";

// ──── Dashboard ────
export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  change: string;
  positive: boolean;
}

export interface PendingAction {
  id: string;
  name: string;
  action: string;
  dept: string;
  time: string;
}

export interface ActivityItem {
  text: string;
  time: string;
  type: "clockin" | "leave" | "new" | "exit";
}
