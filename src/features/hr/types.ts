import type { BaseEntity } from '../../types/common';
import type { ErpRole } from '../../auth/data/staticUsers';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED' | 'RETIRED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'CONSULTANT';
export type Department = 'IT' | 'FINANCE' | 'OPERATIONS' | 'SALES' | 'HR' | 'WAREHOUSE' | 'PROCUREMENT' | 'MANUFACTURING' | 'CUSTOMER_SERVICE' | 'ADMINISTRATION' | 'MARKETING' | 'OTHER';
export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'COMPASSIONATE' | 'STUDY' | 'SABBATICAL' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';

export interface Employee extends BaseEntity {
  employee_number?: string; // Auto-generated employee ID
  employee_id?: string; // Alternative ID field
  
  // Personal Information
  first_name: string;
  last_name: string;
  full_name?: string; // Auto-generated from first + last
  date_of_birth?: string;
  gender?: Gender;
  marital_status?: MaritalStatus;
  national_id?: string; // National ID/SSN
  passport_number?: string;
  
  // Contact Information
  email: string;
  phone?: string;
  alternate_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Employment Details
  role: string; // Job title
  erp_role?: ErpRole; // ERP system role
  department?: Department;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  
  // Dates
  join_date: string; // Hire date
  probation_end_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  last_promotion_date?: string;
  termination_date?: string;
  
  // Manager & Reporting
  manager_id?: string;
  manager_name?: string;
  reporting_manager?: string;
  team?: string;
  
  // Compensation
  salary?: number;
  hourly_rate?: number;
  currency?: string;
  pay_frequency?: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'DAILY';
  bonus?: number;
  commission_rate?: number;
  
  // Benefits
  benefits?: string[]; // Health insurance, dental, etc.
  insurance_policy_number?: string;
  insurance_expiry?: string;
  
  // Skills & Qualifications
  skills?: string[];
  certifications?: string[];
  education_level?: 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'OTHER';
  education_field?: string;
  years_of_experience?: number;
  
  // Performance
  performance_rating?: number; // 1-5
  last_review_date?: string;
  next_review_date?: string;
  
  // Leave Balance
  annual_leave_balance?: number;
  sick_leave_balance?: number;
  other_leave_balance?: number;
  
  // Additional
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}

// Leave Request
export interface LeaveRequest extends BaseEntity {
  leave_number?: string; // Auto-generated
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days?: number; // Auto-calculated
  status: LeaveStatus;
  reason?: string;
  medical_certificate_required?: boolean;
  medical_certificate_provided?: boolean;
  applied_date?: string;
  approved_by?: string;
  approved_date?: string;
  rejected_reason?: string;
  notes?: string;
}

// Performance Review
export interface PerformanceReview extends BaseEntity {
  review_number?: string;
  employee_id: string;
  employee_name?: string;
  review_period_start: string;
  review_period_end: string;
  review_date: string;
  reviewer_id?: string;
  reviewer_name?: string;
  overall_rating?: number; // 1-5
  goals_achieved?: number;
  goals_total?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  comments?: string;
  employee_comments?: string;
  next_review_date?: string;
}

// Training Record
export interface TrainingRecord extends BaseEntity {
  training_id?: string;
  employee_id: string;
  employee_name?: string;
  training_name: string;
  training_type?: 'ONLINE' | 'CLASSROOM' | 'WORKSHOP' | 'SEMINAR' | 'CERTIFICATION' | 'OTHER';
  provider?: string;
  start_date?: string;
  end_date?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completion_percentage?: number;
  certificate_issued?: boolean;
  certificate_number?: string;
  cost?: number;
  notes?: string;
}
