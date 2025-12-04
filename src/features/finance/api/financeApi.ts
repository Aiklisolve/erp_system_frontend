import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { FinanceTransaction, Account, ReceivedPayment } from '../types';

let useStatic = !hasSupabaseConfig;

// Backend API flag - set to true to use backend API
const USE_BACKEND_API = true;

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

// Map backend transaction to frontend format
function mapBackendTransaction(backendTx: any): FinanceTransaction {
  return {
    id: backendTx.id?.toString() || backendTx.transaction_number,
    transaction_number: backendTx.transaction_number,
    reference_number: backendTx.reference_number,
    date: backendTx.transaction_date ? new Date(backendTx.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: backendTx.transaction_type?.toUpperCase() as any || 'EXPENSE',
    status: (backendTx.status?.toUpperCase() || 'POSTED') as any,
    account: backendTx.account_id?.toString() || 'General Account',
    account_type: 'BANK',
    amount: parseFloat(backendTx.amount) || 0,
    currency: (backendTx.currency || 'INR') as any,
    tax_amount: parseFloat(backendTx.tax_amount) || 0,
    net_amount: parseFloat(backendTx.amount) - parseFloat(backendTx.tax_amount || '0'),
    payment_method: (backendTx.payment_method?.toUpperCase().replace(/\s+/g, '_') || 'BANK_TRANSFER') as any,
    payment_date: backendTx.transaction_date ? new Date(backendTx.transaction_date).toISOString().split('T')[0] : undefined,
    party_name: backendTx.vendor_customer_id?.toString() || undefined,
    category: backendTx.category || 'General',
    description: backendTx.description,
    notes: backendTx.notes,
    created_by: backendTx.created_by?.toString(),
    created_at: backendTx.created_at,
    is_reconciled: backendTx.status === 'COMPLETED',
  };
}

export async function listTransactions(): Promise<FinanceTransaction[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('Fetching transactions from backend API...');
      const response = await apiRequest<{ success: boolean; data: { transactions: any[] } }>(
        '/finance/transactions?page=1&limit=100'
      );
      
      console.log('Backend API response:', response);
      
      if (response.success && response.data?.transactions) {
        const mapped = response.data.transactions.map(mapBackendTransaction);
        console.log('Mapped transactions:', mapped.length);
        return mapped;
      }
      
      console.log('No transactions in response, using mock data');
      return mockTransactions;
    } catch (error) {
      console.error('Backend API error, falling back to mock data:', error);
      return mockTransactions;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Creating transaction via backend API:', payload);
      
      // Map frontend format to backend format
      const backendPayload = {
        transaction_type: payload.type,
        category: payload.category || 'General',
        amount: payload.amount,
        currency: payload.currency || 'INR',
        transaction_date: payload.date,
        payment_method: payload.payment_method?.replace(/_/g, ' '),
        reference_number: payload.reference_number || '',
        description: payload.description || '',
        status: payload.status || 'COMPLETED',
        tax_amount: payload.tax_amount || 0,
      };
      
      console.log('Backend payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        '/finance/transactions',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Create response:', response);
      
      if (response.success && response.data) {
        const created = mapBackendTransaction(response.data);
        console.log('Transaction created successfully:', created);
        return created;
      }
      
      throw new Error(response.message || 'Failed to create transaction');
    } catch (error: any) {
      console.error('Backend create error:', error);
      throw new Error(error.message || 'Failed to create transaction');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Updating transaction via backend API:', { id, changes });
      
      // Map frontend format to backend format
      const backendPayload: any = {};
      
      if (changes.type) backendPayload.transaction_type = changes.type;
      if (changes.category) backendPayload.category = changes.category;
      if (changes.amount !== undefined) backendPayload.amount = changes.amount;
      if (changes.currency) backendPayload.currency = changes.currency;
      if (changes.date) backendPayload.transaction_date = changes.date;
      if (changes.payment_method) backendPayload.payment_method = changes.payment_method.replace(/_/g, ' ');
      if (changes.reference_number !== undefined) backendPayload.reference_number = changes.reference_number;
      if (changes.description !== undefined) backendPayload.description = changes.description;
      if (changes.status) backendPayload.status = changes.status;
      if (changes.tax_amount !== undefined) backendPayload.tax_amount = changes.tax_amount;
      
      console.log('Backend update payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/finance/transactions/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Update response:', response);
      
      if (response.success && response.data) {
        const updated = mapBackendTransaction(response.data);
        console.log('Transaction updated successfully:', updated);
        return updated;
      }
      
      throw new Error(response.message || 'Failed to update transaction');
    } catch (error: any) {
      console.error('Backend update error:', error);
      throw new Error(error.message || 'Failed to update transaction');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Deleting transaction via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/finance/transactions/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('Delete response:', response);
      
      if (response.success) {
        console.log('Transaction deleted successfully');
        return;
      }
      
      throw new Error(response.message || 'Failed to delete transaction');
    } catch (error: any) {
      console.error('Backend delete error:', error);
      throw new Error(error.message || 'Failed to delete transaction');
    }
  }
  
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

// Map backend account to frontend format
function mapBackendAccount(backendAcc: any): Account {
  // IMPORTANT: Use backend's numeric ID directly as string for consistency
  const accountId = backendAcc.id?.toString() || backendAcc.account_id?.toString();
  
  return {
    id: accountId, // Convert to string for frontend consistency
    account_number: backendAcc.account_code || '',
    account_name: backendAcc.account_name || '',
    account_type: backendAcc.account_type || 'BANK',
    currency: backendAcc.currency || 'INR',
    opening_balance: parseFloat(backendAcc.opening_balance) || 0,
    current_balance: parseFloat(backendAcc.current_balance) || parseFloat(backendAcc.opening_balance) || 0,
    is_active: backendAcc.is_active !== false,
    created_at: backendAcc.created_at,
  };
}

export async function listAccounts(): Promise<Account[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('Fetching accounts from backend API...');
      const response = await apiRequest<{ success: boolean; data: { accounts: any[] } }>(
        '/finance/accounts'
      );
      
      console.log('Backend accounts response:', response);
      
      if (response.success && response.data?.accounts) {
        const mapped = response.data.accounts.map(mapBackendAccount);
        console.log('Mapped accounts:', mapped.length);
        return mapped;
      }
      
      return mockAccounts;
    } catch (error) {
      console.error('Backend API error, falling back to mock data:', error);
      return mockAccounts;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Creating account via backend API:', payload);
      
      // Map frontend format to backend format
      const backendPayload = {
        account_code: payload.account_number,
        account_name: payload.account_name,
        account_type: payload.account_type,
        opening_balance: payload.opening_balance
      };
      
      console.log('Backend account payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        '/finance/accounts',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Create account response:', response);
      
      if (response.success && response.data) {
        const created = mapBackendAccount(response.data);
        console.log('Account created successfully:', created);
        return created;
      }
      
      throw new Error(response.message || 'Failed to create account');
    } catch (error: any) {
      console.error('Backend create account error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Updating account via backend API:', { id, changes });
      
      // Map frontend format to backend format
      const backendPayload: any = {};
      
      if (changes.account_number) backendPayload.account_code = changes.account_number;
      if (changes.account_name) backendPayload.account_name = changes.account_name;
      if (changes.account_type) backendPayload.account_type = changes.account_type;
      if (changes.opening_balance !== undefined) backendPayload.opening_balance = changes.opening_balance;
      if (changes.current_balance !== undefined) backendPayload.current_balance = changes.current_balance;
      
      console.log('Backend update account payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/finance/accounts/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Update account response:', response);
      
      if (response.success && response.data) {
        const updated = mapBackendAccount(response.data);
        console.log('Account updated successfully:', updated);
        return updated;
      }
      
      throw new Error(response.message || 'Failed to update account');
    } catch (error: any) {
      console.error('Backend update account error:', error);
      throw new Error(error.message || 'Failed to update account');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Deleting account via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/finance/accounts/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('Delete account response:', response);
      
      if (response.success) {
        console.log('Account deleted successfully');
        return;
      }
      
      throw new Error(response.message || 'Failed to delete account');
    } catch (error: any) {
      console.error('Backend delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  }
  
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

// Map backend received payment to frontend format
function mapBackendReceivedPayment(backendPayment: any): ReceivedPayment {
  const paymentId = backendPayment.id?.toString() || backendPayment.payment_id?.toString();
  
  return {
    id: paymentId,
    payment_number: backendPayment.payment_number || `PAY-${paymentId}`,
    customer_id: backendPayment.customer_id?.toString() || '',
    customer_name: backendPayment.customer_name || `Customer ${backendPayment.customer_id}`,
    payment_date: backendPayment.payment_date ? new Date(backendPayment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    amount: parseFloat(backendPayment.amount) || 0,
    currency: (backendPayment.currency || 'INR') as any,
    payment_method: (backendPayment.payment_method?.toUpperCase().replace(/\s+/g, '_') || 'CASH') as any,
    reference_number: backendPayment.reference_number || '',
    notes: backendPayment.notes || '',
    status: 'RECEIVED',
    account: 'Default Account', // Required by type
    created_at: backendPayment.created_at,
  };
}

export async function listReceivedPayments(): Promise<ReceivedPayment[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('Fetching received payments from backend API...');
      const response = await apiRequest<{ success: boolean; data: { received_payments: any[] } | any[] }>(
        '/finance/received-payments'
      );
      
      console.log('Backend received payments response:', response);
      
      // Handle different response formats
      let payments = [];
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          payments = response.data;
        } else if (response.data.received_payments) {
          payments = response.data.received_payments;
        }
      }
      
      if (payments.length > 0) {
        const mapped = payments.map(mapBackendReceivedPayment);
        console.log('Mapped received payments:', mapped.length);
        return mapped;
      }
      
      return mockReceivedPayments;
    } catch (error) {
      console.error('Backend API error, falling back to mock data:', error);
      return mockReceivedPayments;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Creating received payment via backend API:', payload);
      
      // Map frontend format to backend format
      const backendPayload = {
        customer_id: parseInt(payload.customer_id || '1'),
        payment_date: payload.payment_date,
        amount: payload.amount,
        currency: payload.currency || 'INR',
        payment_method: payload.payment_method?.replace(/_/g, ' ') || 'CASH',
        reference_number: payload.reference_number || '',
        notes: payload.notes || ''
      };
      
      console.log('Backend payment payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        '/finance/received-payments',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Create payment response:', response);
      
      if (response.success && response.data) {
        const created = mapBackendReceivedPayment(response.data);
        console.log('Payment created successfully:', created);
        return created;
      }
      
      throw new Error(response.message || 'Failed to create payment');
    } catch (error: any) {
      console.error('Backend create payment error:', error);
      throw new Error(error.message || 'Failed to create payment');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Updating received payment via backend API:', { id, changes });
      
      // Map frontend format to backend format
      const backendPayload: any = {};
      
      if (changes.customer_id) backendPayload.customer_id = parseInt(changes.customer_id) || 1;
      if (changes.payment_date) backendPayload.payment_date = changes.payment_date;
      if (changes.amount !== undefined) backendPayload.amount = changes.amount;
      if (changes.currency) backendPayload.currency = changes.currency;
      if (changes.payment_method) backendPayload.payment_method = changes.payment_method.replace(/_/g, ' ');
      if (changes.reference_number !== undefined) backendPayload.reference_number = changes.reference_number;
      if (changes.notes !== undefined) backendPayload.notes = changes.notes;
      
      console.log('Backend update payment payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/finance/received-payments/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('Update payment response:', response);
      
      if (response.success && response.data) {
        const updated = mapBackendReceivedPayment(response.data);
        console.log('Payment updated successfully:', updated);
        return updated;
      }
      
      throw new Error(response.message || 'Failed to update payment');
    } catch (error: any) {
      console.error('Backend update payment error:', error);
      throw new Error(error.message || 'Failed to update payment');
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('Deleting received payment via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/finance/received-payments/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('Delete payment response:', response);
      
      if (response.success) {
        console.log('Payment deleted successfully');
        return;
      }
      
      throw new Error(response.message || 'Failed to delete payment');
    } catch (error: any) {
      console.error('Backend delete payment error:', error);
      throw new Error(error.message || 'Failed to delete payment');
    }
  }
  
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


