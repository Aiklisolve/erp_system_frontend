import type { BaseEntity } from '../../types/common';
import type { ErpRole } from '../../auth/data/staticUsers';

export type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type ShiftType = 'REGULAR' | 'OVERTIME' | 'HOLIDAY' | 'ON_CALL' | 'TRAINING' | 'MEETING';
export type Department = 'IT' | 'FINANCE' | 'OPERATIONS' | 'SALES' | 'HR' | 'WAREHOUSE' | 'PROCUREMENT' | 'MANUFACTURING' | 'CUSTOMER_SERVICE' | 'ADMINISTRATION' | 'OTHER';

export interface Shift extends BaseEntity {
  shift_number?: string; // Auto-generated shift reference
  employee_id?: string; // Link to employee record
  employee_name: string;
  employee_email?: string;
  
  // Shift Details
  date: string;
  start_time: string;
  end_time: string;
  break_duration_minutes?: number; // Break time in minutes
  total_hours?: number; // Auto-calculated
  
  // Role & Department
  role: string; // ERP role or job title
  erp_role?: ErpRole; // Link to ERP role system
  department?: Department;
  job_title?: string;
  location?: string; // Work location/office
  
  // Shift Classification
  shift_type: ShiftType;
  status: ShiftStatus;
  is_overtime?: boolean;
  
  // Scheduling
  scheduled_by?: string; // Who scheduled this shift
  approved_by?: string; // Manager approval
  approval_date?: string;
  
  // Time Tracking
  clock_in_time?: string; // Actual clock in
  clock_out_time?: string; // Actual clock out
  actual_hours?: number; // Actual worked hours
  
  // Attendance
  attendance_status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'ON_TIME';
  late_minutes?: number;
  early_leave_minutes?: number;
  
  // Tasks & Responsibilities
  assigned_tasks?: string[];
  task_completion_rate?: number; // Percentage
  notes?: string;
  
  // Performance
  performance_rating?: number; // 1-5 rating for this shift
  quality_score?: number; // 1-5 quality score
  
  // Cost & Payroll
  hourly_rate?: number;
  total_pay?: number; // Auto-calculated
  overtime_hours?: number;
  overtime_rate?: number;
  currency?: string;
  
  // Additional
  tags?: string[];
  internal_notes?: string;
}

// Employee (for workforce context)
export interface Employee extends BaseEntity {
  employee_id?: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: Department;
  job_title?: string;
  erp_role?: ErpRole;
  hire_date?: string;
  employment_status?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
  skills?: string[];
  certifications?: string[];
  hourly_rate?: number;
  salary?: number;
  currency?: string;
}

// Schedule Template
export interface ScheduleTemplate extends BaseEntity {
  template_name: string;
  department?: Department;
  start_time: string;
  end_time: string;
  days_of_week: string[]; // ['MON', 'TUE', 'WED', etc.]
  is_active: boolean;
}
