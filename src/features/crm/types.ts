import type { BaseEntity } from '../../types/common';

export interface Customer extends BaseEntity {
  // Basic Information
  customer_number?: string;
  name: string;
  email?: string;
  phone?: string;
  segment?: string;
  
  // Company Information
  company_name?: string;
  industry?: string;
  annual_revenue?: number;
  employee_count?: number;
  website?: string;
  
  // Address Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Tax & Legal Information
  gstin?: string;
  pan_number?: string;
  
  // Contact Information
  contact_person?: string;
  contact_designation?: string;
  
  // Financial Information
  credit_limit?: number;
  payment_terms?: string;
  
  // Additional
  notes?: string;
}

// User Registration types for ERP employees
export type ErpUserRole = 'ADMIN' | 'FINANCE_MANAGER' | 'INVENTORY_MANAGER' | 'PROCUREMENT_OFFICER' | 'HR_MANAGER' | 'SALES_MANAGER' | 'WAREHOUSE_OPERATOR' | 'VIEWER' | 'EMPLOYEE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface ErpUser extends BaseEntity {
  // Basic Information
  employee_number: string;
  email: string;
  password?: string; // Only for creation, backend will hash it
  password_hash?: string; // From backend, read-only
  mobile?: string;
  first_name: string;
  last_name: string;
  username: string;
  
  // Personal Details
  gender?: Gender;
  date_of_birth?: string; // Date in YYYY-MM-DD format from backend, dd/mm/yyyy in form
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  // Employment Details
  role: ErpUserRole;
  employment_status?: EmploymentStatus;
  joining_date: string; // Date in YYYY-MM-DD format from backend, dd/mm/yyyy in form
  designation?: string;
  department?: string;
  manager_name?: string; // Display name (read-only from backend)
  manager_erp_user_id?: number; // For form submission - erp_users.id
  work_phone?: string; // Note: database uses work_phone, not work_phonenumber
  salary?: number;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Bank Details
  bank_account_number?: string;
  bank_name?: string;
  bank_ifsc?: string;
  
  // Identification
  pan_number?: string;
  aadhar_number?: string;
  
  // Additional
  notes?: string;
}

// Leave Management Types
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveType = 'SICK_LEAVE' | 'CASUAL_LEAVE' | 'ANNUAL_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | 'UNPAID_LEAVE' | 'COMP_OFF' | 'OTHER';

export interface Leave extends BaseEntity {
  leave_number: string;
  employee_id: string;
  employee_number?: string;
  employee_name: string;
  employee_email?: string;
  employee_role?: ErpUserRole;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  applied_date?: string;
  approved_by?: string;
  approved_by_id?: string;
  approved_date?: string;
  rejected_by?: string;
  rejected_by_id?: string;
  rejected_date?: string;
  rejection_reason?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

// Task Management Types
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'BUG' | 'FEATURE' | 'SUPPORT' | 'MAINTENANCE' | 'DOCUMENTATION' | 'RESEARCH' | 'OTHER';

export interface Task extends BaseEntity {
  task_number: string;
  title: string;
  description?: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_to_email?: string;
  assigned_to_role?: ErpUserRole;
  assigned_by?: string;
  assigned_by_id?: string;
  assigned_date?: string;
  
  // Dates
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  
  // Progress
  progress_percentage?: number;
  estimated_hours?: number;
  actual_hours?: number;
  
  // Additional
  tags?: string[];
  notes?: string;
  attachments?: string[];
}

