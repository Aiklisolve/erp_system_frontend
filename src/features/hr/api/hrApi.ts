import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Employee } from '../types';

let useStatic = !hasSupabaseConfig;

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Priya Sharma',
    role: 'Finance manager',
    department: 'Finance',
    status: 'ACTIVE',
    join_date: '2022-04-01',
    created_at: '2022-04-01'
  },
  {
    id: 'emp-2',
    name: 'Tom Müller',
    role: 'Warehouse lead',
    department: 'Operations',
    status: 'ON_LEAVE',
    join_date: '2021-09-15',
    created_at: '2021-09-15'
  }
];

function nextId() {
  return `emp-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listEmployees(): Promise<Employee[]> {
  if (useStatic) return mockEmployees;

  try {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) throw error;
    return (data as Employee[]) ?? [];
  } catch (error) {
    handleApiError('hr.listEmployees', error);
    useStatic = true;
    return mockEmployees;
  }
}

export async function createEmployee(
  payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
): Promise<Employee> {
  if (useStatic) {
    const emp: Employee = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockEmployees.unshift(emp);
    return emp;
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    handleApiError('hr.createEmployee', error);
    useStatic = true;
    return createEmployee(payload);
  }
}

export async function updateEmployee(
  id: string,
  changes: Partial<Employee>
): Promise<Employee | null> {
  if (useStatic) {
    const index = mockEmployees.findIndex((e) => e.id === id);
    if (index === -1) return null;
    mockEmployees[index] = { ...mockEmployees[index], ...changes };
    return mockEmployees[index];
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    handleApiError('hr.updateEmployee', error);
    useStatic = true;
    return updateEmployee(id, changes);
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  if (useStatic) {
    const index = mockEmployees.findIndex((e) => e.id === id);
    if (index !== -1) mockEmployees.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('hr.deleteEmployee', error);
    useStatic = true;
    await deleteEmployee(id);
  }
}



