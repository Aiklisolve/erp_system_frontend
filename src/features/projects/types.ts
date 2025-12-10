import type { BaseEntity } from '../../types/common';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type ProjectType = 'FIXED_PRICE' | 'TIME_MATERIALS' | 'HYBRID' | 'SUPPORT' | 'CONSULTING' | 'IMPLEMENTATION' | 'OTHER';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BillingType = 'FIXED' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE' | 'PERCENTAGE';
export type ProjectPhase = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSURE';

export interface Project extends BaseEntity {
  project_code?: string; // Auto-generated project code
  name: string;
  description?: string;
  
  // Client Information
  client: string;
  client_id?: string; // Link to CRM customer
  client_contact_person?: string;
  client_email?: string;
  client_phone?: string;
  
  // Project Classification
  project_type: ProjectType;
  status: ProjectStatus;
  priority?: ProjectPriority;
  phase?: ProjectPhase;
  
  // Dates
  start_date: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  
  // Budget & Financial
  budget: number;
  estimated_budget?: number;
  actual_cost?: number; // Spent so far
  remaining_budget?: number; // Auto-calculated
  revenue?: number; // Revenue from project
  profit?: number; // Revenue - Cost (auto-calculated)
  profit_margin?: number; // Profit % (auto-calculated)
  currency?: string;
  
  // Billing
  billing_type?: BillingType;
  hourly_rate?: number;
  billing_rate?: number;
  billable_hours?: number;
  invoiced_amount?: number;
  paid_amount?: number;
  outstanding_amount?: number; // Auto-calculated
  
  // Resource Management
  project_manager?: string;
  project_manager_id?: string; // Link to user ID
  assigned_team?: string[];
  team_members?: string[]; // Employee IDs or names
  resource_allocation?: number; // Percentage of resources allocated
  
  // Progress & Milestones
  progress_percentage?: number; // 0-100
  completion_percentage?: number; // 0-100
  milestones?: ProjectMilestone[];
  tasks_completed?: number;
  tasks_total?: number;
  
  // Time Tracking
  estimated_hours?: number;
  logged_hours?: number; // Actual hours logged
  remaining_hours?: number; // Auto-calculated
  
  // Deliverables
  deliverables?: string[];
  deliverables_completed?: number;
  
  // Risk & Issues
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues_count?: number;
  risks_count?: number;
  
  // Quality & Performance
  quality_score?: number; // 1-5 rating
  client_satisfaction?: number; // 1-5 rating
  performance_rating?: number; // 1-5 rating
  
  // Project Details
  project_scope?: string;
  objectives?: string[];
  success_criteria?: string[];
  constraints?: string[];
  assumptions?: string[];
  
  // Location & Facilities
  location?: string;
  work_location?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  
  // Contracts & Agreements
  contract_number?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  payment_terms?: string;
  
  // Additional
  tags?: string[];
  notes?: string;
  internal_notes?: string;
}

// Project Milestone
export interface ProjectMilestone extends BaseEntity {
  milestone_code?: string;
  project_id: string;
  name: string;
  description?: string;
  due_date?: string;
  completed_date?: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  completion_percentage?: number;
  deliverables?: string[];
  payment_percentage?: number; // For milestone-based billing
}

// Project Task
export interface ProjectTask extends BaseEntity {
  task_code?: string;
  project_id: string;
  name: string;
  description?: string;
  assigned_to?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
  priority?: ProjectPriority;
  due_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  logged_hours?: number;
  progress_percentage?: number;
}

// Project Resource
export interface ProjectResource extends BaseEntity {
  resource_code?: string;
  project_id: string;
  resource_type?: 'EMPLOYEE' | 'CONTRACTOR' | 'EQUIPMENT' | 'MATERIAL' | 'OTHER';
  resource_id?: string; // Employee ID, equipment ID, etc.
  resource_name?: string;
  allocation_percentage?: number; // 0-100
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  cost?: number;
}

// Project Time Entry
export interface ProjectTimeEntry extends BaseEntity {
  time_entry_code?: string;
  project_id: string;
  task_id?: string;
  employee_id?: string;
  employee_name?: string;
  date: string;
  hours: number;
  billable?: boolean;
  description?: string;
  approved?: boolean;
  approved_by?: string;
  approved_date?: string;
}
