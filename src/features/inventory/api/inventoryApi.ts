import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { InventoryItem } from '../types';

let useStatic = !hasSupabaseConfig;

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'SKU-1001',
    name: 'Cloud subscription seat',
    category: 'Software',
    qty_on_hand: 320,
    reorder_level: 150,
    location: 'Main DC',
    created_at: '2025-01-01'
  },
  {
    id: 'inv-2',
    sku: 'SKU-2005',
    name: 'Barcode scanner',
    category: 'Hardware',
    qty_on_hand: 35,
    reorder_level: 40,
    location: 'WH-01-A',
    created_at: '2025-01-03'
  }
];

function nextId() {
  return `inv-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listInventory(): Promise<InventoryItem[]> {
  if (useStatic) return mockInventory;

  try {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) throw error;
    return (data as InventoryItem[]) ?? [];
  } catch (error) {
    handleApiError('inventory.listInventory', error);
    useStatic = true;
    return mockInventory;
  }
}

export async function createInventoryItem(
  payload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItem> {
  if (useStatic) {
    const item: InventoryItem = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockInventory.unshift(item);
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  } catch (error) {
    handleApiError('inventory.createInventoryItem', error);
    useStatic = true;
    return createInventoryItem(payload);
  }
}

export async function updateInventoryItem(
  id: string,
  changes: Partial<InventoryItem>
): Promise<InventoryItem | null> {
  if (useStatic) {
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index === -1) return null;
    mockInventory[index] = { ...mockInventory[index], ...changes };
    return mockInventory[index];
  }

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  } catch (error) {
    handleApiError('inventory.updateInventoryItem', error);
    useStatic = true;
    return updateInventoryItem(id, changes);
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  if (useStatic) {
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index !== -1) mockInventory.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('inventory.deleteInventoryItem', error);
    useStatic = true;
    await deleteInventoryItem(id);
  }
}


