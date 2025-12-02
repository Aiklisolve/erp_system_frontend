import type { BaseEntity } from '../../types/common';

export type ProductionOrderStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'SCHEDULED'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CLOSED';

export type ProductionOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProductionType = 'MAKE_TO_STOCK' | 'MAKE_TO_ORDER' | 'ASSEMBLY' | 'BATCH' | 'CONTINUOUS' | 'JOB_SHOP';
export type QualityStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'REWORK_REQUIRED' | 'NOT_REQUIRED';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'AUD' | 'CAD';

export interface ProductionOrder extends BaseEntity {
  // Production Order Identification
  production_order_number: string;
  work_order_number?: string;
  reference_number?: string;
  sales_order_number?: string;
  
  // Product Information
  product: string;
  product_code?: string;
  product_id?: string;
  product_description?: string;
  bom_number?: string;
  bom_version?: string;
  
  // Quantity & Units
  planned_qty: number;
  produced_qty?: number;
  good_qty?: number;
  scrap_qty?: number;
  rework_qty?: number;
  pending_qty?: number;
  unit: string;
  
  // Dates
  start_date: string;
  end_date: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  
  // Status & Priority
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  production_type: ProductionType;
  
  // Cost & Financial
  estimated_cost: number;
  actual_cost?: number;
  material_cost?: number;
  labor_cost?: number;
  overhead_cost?: number;
  cost: number; // Total cost
  currency: Currency;
  
  // Production Details
  batch_number?: string;
  lot_number?: string;
  shift?: string;
  production_line?: string;
  work_center?: string;
  machine_id?: string;
  
  // Progress & Efficiency
  progress_percentage?: number;
  completion_percentage?: number;
  efficiency_percentage?: number;
  yield_percentage?: number;
  
  // Time Tracking
  estimated_hours?: number;
  actual_hours?: number;
  setup_time_hours?: number;
  run_time_hours?: number;
  downtime_hours?: number;
  
  // Assignment
  supervisor?: string;
  supervisor_id?: string;
  assigned_team?: string[];
  operators?: string[];
  
  // Quality Control
  quality_check_required?: boolean;
  quality_status?: QualityStatus;
  inspected_by?: string;
  inspection_date?: string;
  inspection_notes?: string;
  
  // Materials & Resources
  raw_materials_allocated?: boolean;
  raw_materials_issued?: boolean;
  tools_allocated?: boolean;
  
  // Customer & Project
  customer_name?: string;
  customer_id?: string;
  project_id?: string;
  department?: string;
  
  // Additional Details
  description?: string;
  notes?: string;
  internal_notes?: string;
  special_instructions?: string;
  
  // Attachments & Tags
  attachments?: string[];
  tags?: string[];
}

