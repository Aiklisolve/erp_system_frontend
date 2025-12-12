import type { BaseEntity } from '../../types/common';

export type FinanceTransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type FinanceTransactionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'POSTED' | 'RECONCILED' | 'VOID' | 'REJECTED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WIRE_TRANSFER' | 'ONLINE_PAYMENT' | 'OTHER';
export type AccountType = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'AUD' | 'CAD';

export interface FinanceTransaction extends BaseEntity {
  // Transaction Identification
  transaction_number: string;
  reference_number?: string;
  invoice_number?: string;
  
  // Basic Information
  date: string;
  due_date?: string;
  type: FinanceTransactionType;
  status: FinanceTransactionStatus;
  
  // Account Information
  account: string;
  account_type: AccountType;
  account_number?: string;
  from_account?: string;
  to_account?: string;
  
  // Amount Details
  amount: number;
  currency: Currency;
  exchange_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  net_amount?: number;
  
  // Payment Information
  payment_method: PaymentMethod;
  payment_terms?: string;
  payment_date?: string;
  check_number?: string;
  transaction_id?: string;
  
  // Party Information
  party_name?: string;
  party_type?: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'OTHER';
  party_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Category & Classification
  category?: string;
  subcategory?: string;
  department?: string;
  project_id?: string;
  cost_center?: string;
  
  // Approval & Workflow
  created_by?: string;
  approved_by?: string;
  approved_date?: string;
  posted_by?: string;
  posted_date?: string;
  reconciled_by?: string;
  reconciled_date?: string;
  
  // Additional Details
  description?: string;
  notes?: string;
  internal_notes?: string;
  attachments?: string[];
  tags?: string[];
  
  // Reconciliation
  is_reconciled?: boolean;
  bank_statement_date?: string;
  bank_statement_ref?: string;
  
  // Recurring
  is_recurring?: boolean;
  recurrence_pattern?: string;
  next_occurrence_date?: string;
}

// Account Management
export interface Account extends BaseEntity {
  account_number: string;
  account_name: string;
  account_type: AccountType;
  parent_account?: string;
  currency: Currency;
  opening_balance: number;
  current_balance: number;
  available_balance?: number;
  bank_name?: string;
  branch_name?: string;
  ifsc_code?: string;
  swift_code?: string;
  account_holder_name?: string;
  owner_user_id?: number;
  is_active: boolean;
  is_default?: boolean;
  description?: string;
  notes?: string;
}

// Received Payments
export interface ReceivedPayment extends BaseEntity {
  payment_number: string;
  payment_date: string;
  customer_name: string;
  customer_id?: string;
  invoice_number?: string;
  invoice_id?: string;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  reference_number?: string;
  transaction_id?: string;
  account: string;
  status: 'PENDING' | 'RECEIVED' | 'CLEARED' | 'BOUNCED' | 'REFUNDED';
  notes?: string;
  received_by?: string;
  cleared_date?: string;
}

// Transaction History
export type TransactionDirection = 'IN' | 'OUT' | 'TRANSFER';
export type ReconciliationStatus = 'PENDING' | 'RECONCILED' | 'DISCREPANCY' | 'NOT_REQUIRED';

export interface TransactionHistory extends BaseEntity {
  transaction_number: string;
  category_id?: number;
  category_name?: string;
  transaction_direction: TransactionDirection;
  transaction_type: string;
  transaction_title: string;
  transaction_description?: string;
  transaction_amount: number;
  transaction_date: string;
  transaction_status: FinanceTransactionStatus;
  payment_method?: PaymentMethod;
  reference_number?: string;
  source_account_id?: number;
  source_account_name?: string;
  destination_account_id?: number;
  destination_account_name?: string;
  counterparty_name?: string;
  counterparty_details?: string;
  due_date?: string;
  actual_completion_date?: string;
  approval_required: boolean;
  approved_by_emp_id?: number;
  approved_by_name?: string;
  approval_datetime?: string;
  approval_comments?: string;
  rejection_reason?: string;
  rejected_by_emp_id?: number;
  rejected_by_name?: string;
  rejection_datetime?: string;
  source_reference_table?: string;
  source_reference_id?: number;
  supporting_documents?: string[];
  transaction_notes?: string;
  reconciliation_status: ReconciliationStatus;
  reconciled_by_emp_id?: number;
  reconciled_by_name?: string;
  reconciliation_date?: string;
  reconciliation_notes?: string;
  tags?: string[];
  currency: Currency;
}

// Transfer Approvals
export type TransferApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface TransferApproval extends BaseEntity {
  approval_id?: number; // Backend's approval_id for approve/reject APIs
  transfer_number: string;
  from_employee_id?: number;
  from_employee_name?: string;
  to_employee_id?: number;
  to_employee_name?: string;
  from_account_id: number;
  from_account_name: string;
  to_account_id: number;
  to_account_name: string;
  amount: number;
  currency: Currency;
  purpose: string;
  requested_date: string;
  expected_date?: string;
  days_pending: number;
  status: TransferApprovalStatus;
  comments?: string;
  approved_by_emp_id?: number;
  approved_by_name?: string;
  approval_datetime?: string;
  approval_comments?: string;
  rejected_by_emp_id?: number;
  rejected_by_name?: string;
  rejection_datetime?: string;
  rejection_reason?: string;
  supporting_documents?: string[];
  notes?: string;
}


