import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { SalesOrder } from '../types';

let useStatic = !hasSupabaseConfig;

const mockOrders: SalesOrder[] = [
  {
    id: 'so-1',
    customer: 'Acme Retail Co.',
    date: '2025-01-03',
    status: 'CONFIRMED',
    total_amount: 18450,
    currency: 'USD',
    created_at: '2025-01-03'
  },
  {
    id: 'so-2',
    customer: 'Global Logistics Ltd.',
    date: '2025-01-06',
    status: 'PENDING',
    total_amount: 7200,
    currency: 'USD',
    created_at: '2025-01-06'
  }
];

function nextId() {
  return `so-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSalesOrders(): Promise<SalesOrder[]> {
  if (useStatic) return mockOrders;

  try {
    const { data, error } = await supabase.from('sales_orders').select('*');
    if (error) throw error;
    return (data as SalesOrder[]) ?? [];
  } catch (error) {
    handleApiError('orders.listSalesOrders', error);
    useStatic = true;
    return mockOrders;
  }
}

export async function createSalesOrder(
  payload: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<SalesOrder> {
  if (useStatic) {
    const order: SalesOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockOrders.unshift(order);
    return order;
  }

  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SalesOrder;
  } catch (error) {
    handleApiError('orders.createSalesOrder', error);
    useStatic = true;
    return createSalesOrder(payload);
  }
}

export async function updateSalesOrder(
  id: string,
  changes: Partial<SalesOrder>
): Promise<SalesOrder | null> {
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    mockOrders[index] = { ...mockOrders[index], ...changes };
    return mockOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as SalesOrder;
  } catch (error) {
    handleApiError('orders.updateSalesOrder', error);
    useStatic = true;
    return updateSalesOrder(id, changes);
  }
}

export async function deleteSalesOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index !== -1) mockOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('sales_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('orders.deleteSalesOrder', error);
    useStatic = true;
    await deleteSalesOrder(id);
  }
}


