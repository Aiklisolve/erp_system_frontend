import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Supplier } from '../types';

let useStatic = !hasSupabaseConfig;

const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Acme Components',
    contact_person: 'Sarah Johnson',
    phone: '+1 555-0101',
    rating: 4.6,
    created_at: '2025-01-01'
  },
  {
    id: 'sup-2',
    name: 'Global Logistics',
    contact_person: 'Michael Chen',
    phone: '+1 555-2300',
    rating: 4.2,
    created_at: '2025-01-03'
  }
];

function nextId() {
  return `sup-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSuppliers(): Promise<Supplier[]> {
  if (useStatic) return mockSuppliers;

  try {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw error;
    return (data as Supplier[]) ?? [];
  } catch (error) {
    handleApiError('supplyChain.listSuppliers', error);
    useStatic = true;
    return mockSuppliers;
  }
}

export async function createSupplier(
  payload: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
): Promise<Supplier> {
  if (useStatic) {
    const supplier: Supplier = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockSuppliers.unshift(supplier);
    return supplier;
  }

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  } catch (error) {
    handleApiError('supplyChain.createSupplier', error);
    useStatic = true;
    return createSupplier(payload);
  }
}

export async function updateSupplier(
  id: string,
  changes: Partial<Supplier>
): Promise<Supplier | null> {
  if (useStatic) {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    mockSuppliers[index] = { ...mockSuppliers[index], ...changes };
    return mockSuppliers[index];
  }

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  } catch (error) {
    handleApiError('supplyChain.updateSupplier', error);
    useStatic = true;
    return updateSupplier(id, changes);
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  if (useStatic) {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index !== -1) mockSuppliers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('supplyChain.deleteSupplier', error);
    useStatic = true;
    await deleteSupplier(id);
  }
}


