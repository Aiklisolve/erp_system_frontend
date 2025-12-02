import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { FinanceTransaction, Account, ReceivedPayment } from '../types';

let useStatic = !hasSupabaseConfig;

const mockTransactions: FinanceTransaction[] = [
  {
    id: 'tx-001',
    transaction_number: 'TXN-2025-001',
    reference_number: 'REF-001',
    invoice_number: 'INV-2025-001',
    date: '2025-01-05',
    due_date: '2025-02-05',
    type: 'INCOME',
    status: 'POSTED',
    account: 'Bank Account - Main',
    account_type: 'BANK',
    account_number: 'ACC-1001',
    amount: 125000,
    currency: 'USD',
    tax_amount: 12500,
    net_amount: 112500,
    payment_method: 'BANK_TRANSFER',
    payment_terms: 'Net 30',
    payment_date: '2025-01-05',
    transaction_id: 'TXN-BANK-001',
    party_name: 'Acme Manufacturing Corp',
    party_type: 'CUSTOMER',
    party_id: 'CUST-001',
    contact_person: 'John Smith',
    contact_email: 'john.smith@acmemfg.com',
    contact_phone: '+1-555-0101',
    category: 'Product Sales',
    subcategory: 'Manufacturing Equipment',
    department: 'Sales',
    project_id: 'PROJ-2025-001',
    cost_center: 'CC-SALES-01',
    created_by: 'Sarah Johnson',
    approved_by: 'Mike Wilson',
    approved_date: '2025-01-05',
    posted_by: 'Finance Team',
    posted_date: '2025-01-05',
    is_reconciled: true,
    reconciled_by: 'Lisa Anderson',
    reconciled_date: '2025-01-06',
    description: 'Payment received for manufacturing equipment order',
    notes: 'January product sales - Manufacturing module implementation',
    tags: ['sales', 'manufacturing', 'equipment'],
    created_at: '2025-01-05'
  },
  {
    id: 'tx-002',
    transaction_number: 'TXN-2025-002',
    reference_number: 'REF-002',
    date: '2025-01-06',
    type: 'EXPENSE',
    status: 'POSTED',
    account: 'Expense - Cloud Services',
    account_type: 'EXPENSE',
    amount: 8500,
    currency: 'USD',
    tax_amount: 850,
    net_amount: 7650,
    payment_method: 'CREDIT_CARD',
    payment_date: '2025-01-06',
    party_name: 'AWS Cloud Services',
    party_type: 'VENDOR',
    party_id: 'VEND-001',
    contact_email: 'billing@aws.com',
    category: 'IT Infrastructure',
    subcategory: 'Cloud Hosting',
    department: 'IT',
    cost_center: 'CC-IT-01',
    created_by: 'Tom Brown',
    approved_by: 'Sarah Johnson',
    approved_date: '2025-01-06',
    posted_by: 'Finance Team',
    posted_date: '2025-01-06',
    is_reconciled: true,
    description: 'Monthly cloud hosting and infrastructure costs',
    notes: 'AWS services for ERP system hosting',
    tags: ['cloud', 'infrastructure', 'monthly'],
    created_at: '2025-01-06'
  },
  {
    id: 'tx-003',
    transaction_number: 'TXN-2025-003',
    reference_number: 'REF-003',
    invoice_number: 'INV-2025-003',
    date: '2025-01-08',
    due_date: '2025-02-08',
    type: 'INCOME',
    status: 'APPROVED',
    account: 'Bank Account - Main',
    account_type: 'BANK',
    amount: 95000,
    currency: 'USD',
    tax_amount: 9500,
    net_amount: 85500,
    payment_method: 'WIRE_TRANSFER',
    payment_terms: 'Net 30',
    party_name: 'Tech Solutions Inc',
    party_type: 'CUSTOMER',
    party_id: 'CUST-002',
    contact_person: 'Emily Davis',
    contact_email: 'emily.davis@techsolutions.com',
    contact_phone: '+1-555-0202',
    category: 'Service Revenue',
    subcategory: 'Consulting',
    department: 'Services',
    project_id: 'PROJ-2025-002',
    created_by: 'Mike Wilson',
    approved_by: 'Sarah Johnson',
    approved_date: '2025-01-08',
    is_reconciled: false,
    description: 'ERP consulting and implementation services',
    notes: 'Manufacturing module customization project',
    tags: ['consulting', 'implementation', 'manufacturing'],
    created_at: '2025-01-08'
  },
  {
    id: 'tx-004',
    transaction_number: 'TXN-2025-004',
    date: '2025-01-10',
    type: 'EXPENSE',
    status: 'PENDING',
    account: 'Expense - Salaries',
    account_type: 'EXPENSE',
    amount: 185000,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER',
    party_type: 'EMPLOYEE',
    category: 'Payroll',
    subcategory: 'Monthly Salaries',
    department: 'HR',
    cost_center: 'CC-HR-01',
    created_by: 'HR Manager',
    description: 'Monthly salary payment for January 2025',
    notes: 'Pending approval from Finance Manager',
    tags: ['payroll', 'salaries', 'monthly'],
    created_at: '2025-01-10'
  },
  {
    id: 'tx-005',
    transaction_number: 'TXN-2025-005',
    reference_number: 'REF-005',
    date: '2025-01-12',
    type: 'EXPENSE',
    status: 'POSTED',
    account: 'Expense - Raw Materials',
    account_type: 'EXPENSE',
    amount: 45000,
    currency: 'USD',
    payment_method: 'CHECK',
    check_number: 'CHK-001',
    payment_date: '2025-01-12',
    party_name: 'Industrial Suppliers Ltd',
    party_type: 'VENDOR',
    party_id: 'VEND-002',
    contact_person: 'Robert Chen',
    contact_email: 'robert.chen@industrialsuppliers.com',
    category: 'Manufacturing',
    subcategory: 'Raw Materials',
    department: 'Production',
    cost_center: 'CC-PROD-01',
    created_by: 'Production Manager',
    approved_by: 'Operations Director',
    approved_date: '2025-01-12',
    posted_by: 'Finance Team',
    posted_date: '2025-01-12',
    is_reconciled: false,
    description: 'Purchase of raw materials for production',
    notes: 'Steel and aluminum for manufacturing orders',
    tags: ['manufacturing', 'raw-materials', 'production'],
    created_at: '2025-01-12'
  },
  {
    id: 'tx-006',
    transaction_number: 'TXN-2025-006',
    date: '2025-01-15',
    type: 'TRANSFER',
    status: 'POSTED',
    from_account: 'Bank Account - Main',
    to_account: 'Cash Account - Petty Cash',
    account: 'Bank Account - Main',
    account_type: 'BANK',
    amount: 5000,
    currency: 'USD',
    payment_method: 'CASH',
    category: 'Internal Transfer',
    department: 'Finance',
    created_by: 'Finance Manager',
    approved_by: 'CFO',
    approved_date: '2025-01-15',
    posted_by: 'Finance Team',
    posted_date: '2025-01-15',
    is_reconciled: true,
    description: 'Transfer to petty cash for operational expenses',
    notes: 'Monthly petty cash replenishment',
    tags: ['transfer', 'petty-cash', 'internal'],
    created_at: '2025-01-15'
  }
];

const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    account_number: 'ACC-1001',
    account_name: 'Bank Account - Main',
    account_type: 'BANK',
    currency: 'USD',
    opening_balance: 500000,
    current_balance: 675000,
    available_balance: 650000,
    bank_name: 'First National Bank',
    branch_name: 'Downtown Branch',
    ifsc_code: 'FNBK0001234',
    swift_code: 'FNBKUS33XXX',
    account_holder_name: 'OrbitERP Manufacturing Inc',
    is_active: true,
    is_default: true,
    description: 'Primary business checking account',
    notes: 'Main operating account for all business transactions',
    created_at: '2024-01-01'
  },
  {
    id: 'acc-002',
    account_number: 'ACC-1002',
    account_name: 'Cash Account - Petty Cash',
    account_type: 'CASH',
    currency: 'USD',
    opening_balance: 10000,
    current_balance: 8500,
    available_balance: 8500,
    is_active: true,
    description: 'Petty cash for small operational expenses',
    notes: 'Managed by Finance Department',
    created_at: '2024-01-01'
  },
  {
    id: 'acc-003',
    account_number: 'ACC-1003',
    account_name: 'Bank Account - Payroll',
    account_type: 'BANK',
    currency: 'USD',
    opening_balance: 200000,
    current_balance: 185000,
    available_balance: 185000,
    bank_name: 'First National Bank',
    branch_name: 'Downtown Branch',
    account_holder_name: 'OrbitERP Manufacturing Inc - Payroll',
    is_active: true,
    description: 'Dedicated account for payroll processing',
    notes: 'Used exclusively for employee salary payments',
    created_at: '2024-01-01'
  },
  {
    id: 'acc-004',
    account_number: 'ACC-2001',
    account_name: 'Credit Card - Business',
    account_type: 'CREDIT_CARD',
    currency: 'USD',
    opening_balance: 0,
    current_balance: -15000,
    available_balance: 35000,
    bank_name: 'Business Credit Union',
    account_holder_name: 'OrbitERP Manufacturing Inc',
    is_active: true,
    description: 'Business credit card for operational expenses',
    notes: 'Credit limit: $50,000',
    created_at: '2024-01-01'
  }
];

const mockReceivedPayments: ReceivedPayment[] = [
  {
    id: 'pay-001',
    payment_number: 'PAY-2025-001',
    payment_date: '2025-01-05',
    customer_name: 'Acme Manufacturing Corp',
    customer_id: 'CUST-001',
    invoice_number: 'INV-2025-001',
    invoice_id: 'inv-001',
    amount: 125000,
    currency: 'USD',
    payment_method: 'BANK_TRANSFER',
    reference_number: 'REF-001',
    transaction_id: 'TXN-BANK-001',
    account: 'Bank Account - Main',
    status: 'CLEARED',
    notes: 'Payment for manufacturing equipment order',
    received_by: 'Sarah Johnson',
    cleared_date: '2025-01-06',
    created_at: '2025-01-05'
  },
  {
    id: 'pay-002',
    payment_number: 'PAY-2025-002',
    payment_date: '2025-01-08',
    customer_name: 'Tech Solutions Inc',
    customer_id: 'CUST-002',
    invoice_number: 'INV-2025-003',
    invoice_id: 'inv-003',
    amount: 95000,
    currency: 'USD',
    payment_method: 'WIRE_TRANSFER',
    reference_number: 'REF-003',
    account: 'Bank Account - Main',
    status: 'RECEIVED',
    notes: 'Payment for ERP consulting services',
    received_by: 'Mike Wilson',
    created_at: '2025-01-08'
  },
  {
    id: 'pay-003',
    payment_number: 'PAY-2025-003',
    payment_date: '2025-01-10',
    customer_name: 'Global Manufacturing Co',
    customer_id: 'CUST-004',
    invoice_number: 'INV-2025-005',
    invoice_id: 'inv-005',
    amount: 75000,
    currency: 'USD',
    payment_method: 'CHECK',
    reference_number: 'CHK-1001',
    account: 'Bank Account - Main',
    status: 'PENDING',
    notes: 'Check payment - awaiting clearance',
    received_by: 'Finance Team',
    created_at: '2025-01-10'
  }
];

function nextId() {
  return `tx-${Math.random().toString(36).slice(2, 8)}`;
}

function nextAccountId() {
  return `acc-${Math.random().toString(36).slice(2, 8)}`;
}

function nextPaymentId() {
  return `pay-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listTransactions(): Promise<FinanceTransaction[]> {
  if (useStatic) return mockTransactions;

  try {
    const { data, error } = await supabase.from('finance_transactions').select('*');
    if (error) throw error;
    return (data as FinanceTransaction[]) ?? [];
  } catch (error) {
    handleApiError('finance.listTransactions', error);
    useStatic = true;
    return mockTransactions;
  }
}

export async function createTransaction(
  payload: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<FinanceTransaction> {
  if (useStatic) {
    const tx: FinanceTransaction = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockTransactions.unshift(tx);
    return tx;
  }

  try {
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  } catch (error) {
    handleApiError('finance.createTransaction', error);
    useStatic = true;
    return createTransaction(payload);
  }
}

export async function updateTransaction(
  id: string,
  changes: Partial<FinanceTransaction>
): Promise<FinanceTransaction | null> {
  if (useStatic) {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    mockTransactions[index] = { ...mockTransactions[index], ...changes };
    return mockTransactions[index];
  }

  try {
    const { data, error } = await supabase
      .from('finance_transactions')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  } catch (error) {
    handleApiError('finance.updateTransaction', error);
    useStatic = true;
    return updateTransaction(id, changes);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  if (useStatic) {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index !== -1) mockTransactions.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('finance.deleteTransaction', error);
    useStatic = true;
    await deleteTransaction(id);
  }
}

// ============================================
// ACCOUNTS API
// ============================================

export async function listAccounts(): Promise<Account[]> {
  if (useStatic) return mockAccounts;

  try {
    const { data, error } = await supabase.from('finance_accounts').select('*');
    if (error) throw error;
    return (data as Account[]) ?? [];
  } catch (error) {
    handleApiError('finance.listAccounts', error);
    useStatic = true;
    return mockAccounts;
  }
}

export async function createAccount(
  payload: Omit<Account, 'id' | 'created_at' | 'updated_at'>
): Promise<Account> {
  if (useStatic) {
    const account: Account = {
      ...payload,
      id: nextAccountId(),
      created_at: new Date().toISOString()
    };
    mockAccounts.unshift(account);
    return account;
  }

  try {
    const { data, error } = await supabase
      .from('finance_accounts')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Account;
  } catch (error) {
    handleApiError('finance.createAccount', error);
    useStatic = true;
    return createAccount(payload);
  }
}

export async function updateAccount(
  id: string,
  changes: Partial<Account>
): Promise<Account | null> {
  if (useStatic) {
    const index = mockAccounts.findIndex((a) => a.id === id);
    if (index === -1) return null;
    mockAccounts[index] = { ...mockAccounts[index], ...changes };
    return mockAccounts[index];
  }

  try {
    const { data, error } = await supabase
      .from('finance_accounts')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Account;
  } catch (error) {
    handleApiError('finance.updateAccount', error);
    useStatic = true;
    return updateAccount(id, changes);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  if (useStatic) {
    const index = mockAccounts.findIndex((a) => a.id === id);
    if (index !== -1) mockAccounts.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('finance_accounts').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('finance.deleteAccount', error);
    useStatic = true;
    await deleteAccount(id);
  }
}

// ============================================
// RECEIVED PAYMENTS API
// ============================================

export async function listReceivedPayments(): Promise<ReceivedPayment[]> {
  if (useStatic) return mockReceivedPayments;

  try {
    const { data, error } = await supabase.from('received_payments').select('*');
    if (error) throw error;
    return (data as ReceivedPayment[]) ?? [];
  } catch (error) {
    handleApiError('finance.listReceivedPayments', error);
    useStatic = true;
    return mockReceivedPayments;
  }
}

export async function createReceivedPayment(
  payload: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'>
): Promise<ReceivedPayment> {
  if (useStatic) {
    const payment: ReceivedPayment = {
      ...payload,
      id: nextPaymentId(),
      created_at: new Date().toISOString()
    };
    mockReceivedPayments.unshift(payment);
    return payment;
  }

  try {
    const { data, error } = await supabase
      .from('received_payments')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ReceivedPayment;
  } catch (error) {
    handleApiError('finance.createReceivedPayment', error);
    useStatic = true;
    return createReceivedPayment(payload);
  }
}

export async function updateReceivedPayment(
  id: string,
  changes: Partial<ReceivedPayment>
): Promise<ReceivedPayment | null> {
  if (useStatic) {
    const index = mockReceivedPayments.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockReceivedPayments[index] = { ...mockReceivedPayments[index], ...changes };
    return mockReceivedPayments[index];
  }

  try {
    const { data, error } = await supabase
      .from('received_payments')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ReceivedPayment;
  } catch (error) {
    handleApiError('finance.updateReceivedPayment', error);
    useStatic = true;
    return updateReceivedPayment(id, changes);
  }
}

export async function deleteReceivedPayment(id: string): Promise<void> {
  if (useStatic) {
    const index = mockReceivedPayments.findIndex((p) => p.id === id);
    if (index !== -1) mockReceivedPayments.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('received_payments').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('finance.deleteReceivedPayment', error);
    useStatic = true;
    await deleteReceivedPayment(id);
  }
}


