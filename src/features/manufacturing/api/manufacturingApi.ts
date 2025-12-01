import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { ProductionOrder } from '../types';

let useStatic = !hasSupabaseConfig;

const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'mo-1',
    product: 'ERP-001 · Cloud subscription bundle',
    planned_qty: 120,
    status: 'IN_PROGRESS',
    start_date: '2025-01-02',
    end_date: '2025-01-15',
    created_at: '2025-01-02'
  },
  {
    id: 'mo-2',
    product: 'HW-100 · Handheld scanner kit',
    planned_qty: 40,
    status: 'PLANNED',
    start_date: '2025-01-10',
    end_date: '2025-01-20',
    created_at: '2025-01-05'
  }
];

function nextId() {
  return `mo-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProductionOrders(): Promise<ProductionOrder[]> {
  if (useStatic) return mockProductionOrders;

  try {
    const { data, error } = await supabase.from('production_orders').select('*');
    if (error) throw error;
    return (data as ProductionOrder[]) ?? [];
  } catch (error) {
    handleApiError('manufacturing.listProductionOrders', error);
    useStatic = true;
    return mockProductionOrders;
  }
}

export async function createProductionOrder(
  payload: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductionOrder> {
  if (useStatic) {
    const order: ProductionOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockProductionOrders.unshift(order);
    return order;
  }

  try {
    const { data, error } = await supabase
      .from('production_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ProductionOrder;
  } catch (error) {
    handleApiError('manufacturing.createProductionOrder', error);
    useStatic = true;
    return createProductionOrder(payload);
  }
}

export async function updateProductionOrder(
  id: string,
  changes: Partial<ProductionOrder>
): Promise<ProductionOrder | null> {
  if (useStatic) {
    const index = mockProductionOrders.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProductionOrders[index] = { ...mockProductionOrders[index], ...changes };
    return mockProductionOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('production_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductionOrder;
  } catch (error) {
    handleApiError('manufacturing.updateProductionOrder', error);
    useStatic = true;
    return updateProductionOrder(id, changes);
  }
}

export async function deleteProductionOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockProductionOrders.findIndex((p) => p.id === id);
    if (index !== -1) mockProductionOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('production_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('manufacturing.deleteProductionOrder', error);
    useStatic = true;
    await deleteProductionOrder(id);
  }
}


