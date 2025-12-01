import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { FinanceTransaction } from '../types';

let useStatic = !hasSupabaseConfig;

const mockTransactions: FinanceTransaction[] = [
  {
    id: 'tx-1',
    date: '2025-01-05',
    type: 'INCOME',
    account: '4000 - Product revenue',
    amount: 12500,
    currency: 'USD',
    status: 'POSTED',
    notes: 'January SaaS subscriptions',
    created_at: '2025-01-05'
  },
  {
    id: 'tx-2',
    date: '2025-01-06',
    type: 'EXPENSE',
    account: '6000 - Cloud hosting',
    amount: 2100,
    currency: 'USD',
    status: 'POSTED',
    notes: 'Supabase + infra',
    created_at: '2025-01-06'
  }
];

function nextId() {
  return `tx-${Math.random().toString(36).slice(2, 8)}`;
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


