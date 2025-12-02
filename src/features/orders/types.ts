import type { BaseEntity } from '../../types/common';

export type SalesOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentTerms = 'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30' | 'NET_60' | 'NET_90' | 'CUSTOM';
export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'PICKUP' | 'CUSTOM';
export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type OrderSource = 'ONLINE' | 'PHONE' | 'EMAIL' | 'WALK_IN' | 'SALES_REP' | 'OTHER';

export interface SalesOrder extends BaseEntity {
  order_number?: string; // Auto-generated order number
  customer: string;
  customer_phone?: string;
  customer_email?: string;
  contact_person?: string;
  
  // Dates
  date: string; // Order date
  expected_delivery_date?: string;
  shipped_date?: string;
  delivered_date?: string;
  
  // Status
  status: SalesOrderStatus;
  payment_status?: PaymentStatus;
  priority?: OrderPriority;
  
  // Addresses
  shipping_address?: string;
  billing_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  
  // Financial
  subtotal?: number;
  tax_amount?: number;
  shipping_cost?: number;
  discount_amount?: number;
  total_amount: number;
  currency: string;
  
  // Payment & Terms
  payment_terms?: PaymentTerms;
  payment_due_date?: string;
  invoice_number?: string;
  customer_po_number?: string; // Customer's Purchase Order Number
  
  // Shipping
  shipping_method?: ShippingMethod;
  tracking_number?: string;
  warehouse_location?: string;
  
  // Assignment & Source
  sales_representative?: string;
  assigned_to?: string;
  order_source?: OrderSource;
  
  // Additional
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}
