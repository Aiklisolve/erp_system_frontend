import type { BaseEntity } from '../../types/common';

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';
export type PurchaseOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PaymentTerms = 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'NET_90' | 'ADVANCE' | 'COD' | 'CUSTOM';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'AUD' | 'CAD';
export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'FREIGHT' | 'COURIER' | 'PICKUP' | 'DROP_SHIPPING';

export interface PurchaseOrder extends BaseEntity {
  // PO Identification
  po_number: string;
  reference_number?: string;
  requisition_number?: string;
  
  // Supplier Information
  supplier: string;
  supplier_id?: string;
  supplier_contact_person?: string;
  supplier_email?: string;
  supplier_phone?: string;
  
  // Dates
  date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  due_date?: string;
  
  // Status & Priority
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  
  // Financial Details
  subtotal: number;
  tax_amount?: number;
  shipping_cost?: number;
  discount_amount?: number;
  total_amount: number;
  currency: Currency;
  exchange_rate?: number;
  
  // Payment Information
  payment_terms: PaymentTerms;
  payment_terms_days?: number;
  advance_payment_required?: boolean;
  advance_payment_amount?: number;
  advance_payment_percentage?: number;
  
  // Delivery Information
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_postal_code?: string;
  delivery_country?: string;
  delivery_method?: DeliveryMethod;
  tracking_number?: string;
  
  // Items Information
  items_count?: number;
  total_quantity?: number;
  
  // Approval & Workflow
  requested_by?: string;
  requested_by_id?: string;
  approved_by?: string;
  approved_by_id?: string;
  approval_date?: string;
  
  // Department & Project
  department?: string;
  project_id?: string;
  cost_center?: string;
  
  // Additional Details
  description?: string;
  notes?: string;
  internal_notes?: string;
  terms_and_conditions?: string;
  
  // Receiving Information
  received_quantity?: number;
  pending_quantity?: number;
  quality_check_required?: boolean;
  quality_check_passed?: boolean;
  inspected_by?: string;
  inspection_date?: string;
  
  // Attachments & Tags
  attachments?: string[];
  tags?: string[];
}

// Purchase Order Line Items
export interface PurchaseOrderItem extends BaseEntity {
  po_id: string;
  po_number: string;
  line_number: number;
  item_name: string;
  item_code?: string;
  item_description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  tax_percentage?: number;
  tax_amount?: number;
  line_total: number;
  received_quantity?: number;
  pending_quantity?: number;
  notes?: string;
}

