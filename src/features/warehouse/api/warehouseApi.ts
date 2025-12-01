import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { StockMovement } from '../types';

let useStatic = !hasSupabaseConfig;

const mockMovements: StockMovement[] = [
  {
    id: 'mv-1',
    item_id: 'SKU-2005',
    from_location: 'WH-01-A',
    to_location: 'WH-01-B',
    quantity: 10,
    movement_date: '2025-01-04',
    created_at: '2025-01-04'
  },
  {
    id: 'mv-2',
    item_id: 'SKU-1001',
    from_location: 'Main DC',
    to_location: 'Store-03',
    quantity: 40,
    movement_date: '2025-01-07',
    created_at: '2025-01-07'
  }
];

function nextId() {
  return `mv-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listStockMovements(): Promise<StockMovement[]> {
  if (useStatic) return mockMovements;

  try {
    const { data, error } = await supabase.from('stock_movements').select('*');
    if (error) throw error;
    return (data as StockMovement[]) ?? [];
  } catch (error) {
    handleApiError('warehouse.listStockMovements', error);
    useStatic = true;
    return mockMovements;
  }
}

export async function createStockMovement(
  payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
): Promise<StockMovement> {
  if (useStatic) {
    const mv: StockMovement = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockMovements.unshift(mv);
    return mv;
  }

  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as StockMovement;
  } catch (error) {
    handleApiError('warehouse.createStockMovement', error);
    useStatic = true;
    return createStockMovement(payload);
  }
}

export async function updateStockMovement(
  id: string,
  changes: Partial<StockMovement>
): Promise<StockMovement | null> {
  if (useStatic) {
    const index = mockMovements.findIndex((m) => m.id === id);
    if (index === -1) return null;
    mockMovements[index] = { ...mockMovements[index], ...changes };
    return mockMovements[index];
  }

  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as StockMovement;
  } catch (error) {
    handleApiError('warehouse.updateStockMovement', error);
    useStatic = true;
    return updateStockMovement(id, changes);
  }
}

export async function deleteStockMovement(id: string): Promise<void> {
  if (useStatic) {
    const index = mockMovements.findIndex((m) => m.id === id);
    if (index !== -1) mockMovements.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('stock_movements').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('warehouse.deleteStockMovement', error);
    useStatic = true;
    await deleteStockMovement(id);
  }
}


