import type { BaseEntity } from '../../types/common';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
export type SupplierCategory = 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'RETAILER' | 'SERVICE_PROVIDER' | 'OTHER';
export type PaymentTerms = 'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30' | 'NET_60' | 'NET_90' | 'CUSTOM';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'NOT_APPLICABLE';

export interface Supplier extends BaseEntity {
  supplier_code?: string; // Auto-generated supplier code
  name: string;
  legal_name?: string;
  tax_id?: string; // Tax identification number
  registration_number?: string;
  
  // Contact Information
  contact_person: string;
  phone: string;
  email?: string;
  alternate_phone?: string;
  alternate_email?: string;
  website?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Classification
  category?: SupplierCategory;
  status: SupplierStatus;
  rating: number; // 1-5 rating
  
  // Financial
  payment_terms?: PaymentTerms;
  credit_limit?: number;
  currency?: string;
  tax_rate?: number;
  
  // Performance Metrics
  on_time_delivery_rate?: number; // Percentage
  quality_score?: number; // 1-5
  lead_time_days?: number; // Average lead time
  total_orders?: number;
  total_spend?: number;
  last_order_date?: string;
  
  // Risk & Compliance
  risk_level?: RiskLevel;
  compliance_status?: ComplianceStatus;
  certifications?: string[]; // ISO, FDA, etc.
  insurance_expiry?: string;
  
  // Contracts & Agreements
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  contract_type?: 'ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'ONE_TIME' | 'OTHER';
  
  // Assignment
  account_manager?: string;
  procurement_officer?: string;
  
  // Additional
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}

// Purchase Order (for supply chain context)
export interface PurchaseOrder extends BaseEntity {
  po_number?: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  total_amount: number;
  currency?: string;
  items?: PurchaseOrderItem[];
  notes?: string;
}

export interface PurchaseOrderItem {
  item_id: string;
  item_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit?: string;
}

// Supplier Performance Record
export interface SupplierPerformance extends BaseEntity {
  supplier_id: string;
  period_start: string;
  period_end: string;
  on_time_delivery_rate: number;
  quality_score: number;
  lead_time_days: number;
  total_orders: number;
  total_spend: number;
  issues_count?: number;
  notes?: string;
}
