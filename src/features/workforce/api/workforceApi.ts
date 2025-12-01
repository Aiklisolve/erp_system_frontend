import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Shift } from '../types';

let useStatic = !hasSupabaseConfig;

const mockShifts: Shift[] = [
  {
    id: 'sh-1',
    employee_name: 'Alex Rivera',
    date: '2025-01-08',
    start_time: '08:00',
    end_time: '16:00',
    role: 'Warehouse associate',
    created_at: '2025-01-05'
  },
  {
    id: 'sh-2',
    employee_name: 'Jordan Lee',
    date: '2025-01-08',
    start_time: '12:00',
    end_time: '20:00',
    role: 'Customer support',
    created_at: '2025-01-05'
  }
];

function nextId() {
  return `sh-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listShifts(): Promise<Shift[]> {
  if (useStatic) return mockShifts;

  try {
    const { data, error } = await supabase.from('shifts').select('*');
    if (error) throw error;
    return (data as Shift[]) ?? [];
  } catch (error) {
    handleApiError('workforce.listShifts', error);
    useStatic = true;
    return mockShifts;
  }
}

export async function createShift(
  payload: Omit<Shift, 'id' | 'created_at' | 'updated_at'>
): Promise<Shift> {
  if (useStatic) {
    const shift: Shift = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockShifts.unshift(shift);
    return shift;
  }

  try {
    const { data, error } = await supabase
      .from('shifts')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Shift;
  } catch (error) {
    handleApiError('workforce.createShift', error);
    useStatic = true;
    return createShift(payload);
  }
}

export async function updateShift(
  id: string,
  changes: Partial<Shift>
): Promise<Shift | null> {
  if (useStatic) {
    const index = mockShifts.findIndex((s) => s.id === id);
    if (index === -1) return null;
    mockShifts[index] = { ...mockShifts[index], ...changes };
    return mockShifts[index];
  }

  try {
    const { data, error } = await supabase
      .from('shifts')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Shift;
  } catch (error) {
    handleApiError('workforce.updateShift', error);
    useStatic = true;
    return updateShift(id, changes);
  }
}

export async function deleteShift(id: string): Promise<void> {
  if (useStatic) {
    const index = mockShifts.findIndex((s) => s.id === id);
    if (index !== -1) mockShifts.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('workforce.deleteShift', error);
    useStatic = true;
    await deleteShift(id);
  }
}


