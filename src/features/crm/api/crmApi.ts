import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Customer } from '../types';

let useStatic = !hasSupabaseConfig;

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Acme Retail Co.',
    email: 'ops@acmeretail.example',
    phone: '+1 555-1000',
    segment: 'Enterprise',
    created_at: '2024-11-01'
  },
  {
    id: 'cust-2',
    name: 'Northwind Traders',
    email: 'info@northwind.example',
    phone: '+1 555-1100',
    segment: 'Mid-market',
    created_at: '2024-12-10'
  }
];

function nextId() {
  return `cust-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listCustomers(): Promise<Customer[]> {
  if (useStatic) return mockCustomers;

  try {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return (data as Customer[]) ?? [];
  } catch (error) {
    handleApiError('crm.listCustomers', error);
    useStatic = true;
    return mockCustomers;
  }
}

export async function createCustomer(
  payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
): Promise<Customer> {
  if (useStatic) {
    const customer: Customer = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockCustomers.unshift(customer);
    return customer;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  } catch (error) {
    handleApiError('crm.createCustomer', error);
    useStatic = true;
    return createCustomer(payload);
  }
}

export async function updateCustomer(
  id: string,
  changes: Partial<Customer>
): Promise<Customer | null> {
  if (useStatic) {
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    mockCustomers[index] = { ...mockCustomers[index], ...changes };
    return mockCustomers[index];
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  } catch (error) {
    handleApiError('crm.updateCustomer', error);
    useStatic = true;
    return updateCustomer(id, changes);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  if (useStatic) {
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index !== -1) mockCustomers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('crm.deleteCustomer', error);
    useStatic = true;
    await deleteCustomer(id);
  }
}


