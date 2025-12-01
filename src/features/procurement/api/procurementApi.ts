import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { PurchaseOrder } from '../types';

let useStatic = !hasSupabaseConfig;

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    supplier: 'Acme Components',
    date: '2025-01-04',
    status: 'SENT',
    total_amount: 5200,
    created_at: '2025-01-04'
  },
  {
    id: 'po-2',
    supplier: 'Global Logistics',
    date: '2025-01-08',
    status: 'RECEIVED',
    total_amount: 1800,
    created_at: '2025-01-08'
  }
];

function nextId() {
  return `po-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (useStatic) return mockPurchaseOrders;

  try {
    const { data, error } = await supabase.from('purchase_orders').select('*');
    if (error) throw error;
    return (data as PurchaseOrder[]) ?? [];
  } catch (error) {
    handleApiError('procurement.listPurchaseOrders', error);
    useStatic = true;
    return mockPurchaseOrders;
  }
}

export async function createPurchaseOrder(
  payload: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<PurchaseOrder> {
  if (useStatic) {
    const po: PurchaseOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockPurchaseOrders.unshift(po);
    return po;
  }

  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  } catch (error) {
    handleApiError('procurement.createPurchaseOrder', error);
    useStatic = true;
    return createPurchaseOrder(payload);
  }
}

export async function updatePurchaseOrder(
  id: string,
  changes: Partial<PurchaseOrder>
): Promise<PurchaseOrder | null> {
  if (useStatic) {
    const index = mockPurchaseOrders.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockPurchaseOrders[index] = { ...mockPurchaseOrders[index], ...changes };
    return mockPurchaseOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  } catch (error) {
    handleApiError('procurement.updatePurchaseOrder', error);
    useStatic = true;
    return updatePurchaseOrder(id, changes);
  }
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockPurchaseOrders.findIndex((p) => p.id === id);
    if (index !== -1) mockPurchaseOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('procurement.deletePurchaseOrder', error);
    useStatic = true;
    await deletePurchaseOrder(id);
  }
}


