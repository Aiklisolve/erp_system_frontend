import type { BaseEntity } from '../../types/common';

export type ReportType = 
  | 'HR_EMPLOYEE'
  | 'HR_ATTENDANCE'
  | 'HR_LEAVE'
  | 'HR_PAYROLL'
  | 'FINANCE_TRANSACTION'
  | 'FINANCE_BALANCE_SHEET'
  | 'FINANCE_PROFIT_LOSS'
  | 'PROJECT_SUMMARY'
  | 'PROJECT_PROGRESS'
  | 'PROJECT_BUDGET'
  | 'INVENTORY_STOCK'
  | 'INVENTORY_MOVEMENT'
  | 'SALES_ORDER'
  | 'SALES_REVENUE'
  | 'PROCUREMENT_PURCHASE'
  | 'PROCUREMENT_VENDOR'
  | 'WAREHOUSE_STOCK'
  | 'WAREHOUSE_MOVEMENT'
  | 'CUSTOMER_SUMMARY'
  | 'CUSTOMER_SALES';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Report extends BaseEntity {
  report_code?: string;
  report_type: ReportType;
  report_name: string;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  
  // Date Range
  start_date?: string;
  end_date?: string;
  
  // Filters
  filters?: Record<string, any>;
  
  // Generated Report Info
  file_url?: string;
  file_name?: string;
  file_size?: number;
  generated_at?: string;
  generated_by?: string;
  generated_by_name?: string;
  
  // Error Info
  error_message?: string;
  
  // Parameters
  parameters?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  report_type: ReportType;
  name: string;
  description?: string;
  default_filters?: Record<string, any>;
  default_format?: ReportFormat;
}

