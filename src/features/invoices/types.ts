import type { BaseEntity } from '../../types/common';

export type InvoiceStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REFUNDED';

export type InvoiceType = 
  | 'SALES'
  | 'PURCHASE'
  | 'SERVICE'
  | 'PRODUCT'
  | 'RECURRING';

export type PaymentMethod = 
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CHEQUE'
  | 'ONLINE_PAYMENT'
  | 'OTHER';

export interface InvoiceItem {
  id?: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount?: number;
  line_total: number;
  tax_amount?: number;
  total_amount: number;
}

export interface Invoice extends BaseEntity {
  invoice_number: string;
  invoice_code?: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  
  // Customer/Vendor Information
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_postal_code?: string;
  customer_country?: string;
  customer_tax_id?: string;
  
  // Invoice Dates
  invoice_date: string; // ISO date string
  due_date: string; // ISO date string
  paid_date?: string; // ISO date string
  
  // Financial Information
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  shipping_amount?: number;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  currency: string; // e.g., 'USD', 'INR', 'EUR'
  
  // Invoice Items
  items: InvoiceItem[];
  
  // Payment Information
  payment_method?: PaymentMethod;
  payment_reference?: string;
  payment_notes?: string;
  
  // Additional Information
  notes?: string;
  terms?: string; // Payment terms
  po_number?: string; // Purchase Order Number
  reference_number?: string;
  
  // Related Entities
  order_id?: string; // Related sales order
  project_id?: string; // Related project
  quote_id?: string; // Related quote
  
  // Recurring Invoice
  is_recurring?: boolean;
  recurring_frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  recurring_end_date?: string;
  
  // Attachments
  attachments?: string[]; // URLs to attached files
  
  // Approval Workflow
  approved_by?: string;
  approved_at?: string;
  
  // Created/Updated By
  created_by?: string;
  created_by_name?: string;
  updated_by?: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_date: string;
  payment_amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

