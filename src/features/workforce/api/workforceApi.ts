import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Shift } from '../types';

let useStatic = !hasSupabaseConfig;

const mockShifts: Shift[] = [
  {
    id: 'sh-1',
    shift_number: 'SHF-2025-ABC123',
    employee_id: 'emp-1',
    employee_name: 'Alex Rivera',
    employee_email: 'alex.rivera@erp.local',
    date: '2025-01-08',
    start_time: '08:00',
    end_time: '16:00',
    break_duration_minutes: 30,
    total_hours: 7.5,
    role: 'Warehouse Associate',
    erp_role: 'WAREHOUSE_OPERATOR',
    department: 'WAREHOUSE',
    job_title: 'Warehouse Operator',
    location: 'Main Warehouse',
    shift_type: 'REGULAR',
    status: 'COMPLETED',
    is_overtime: false,
    scheduled_by: 'HR Manager',
    approved_by: 'Operations Manager',
    approval_date: '2025-01-05',
    clock_in_time: '08:05',
    clock_out_time: '16:10',
    actual_hours: 7.75,
    attendance_status: 'LATE',
    late_minutes: 5,
    assigned_tasks: ['Stock receiving', 'Inventory count', 'Order picking'],
    task_completion_rate: 100,
    performance_rating: 4.5,
    quality_score: 4.7,
    hourly_rate: 18.50,
    total_pay: 143.38,
    currency: 'USD',
    notes: 'Completed all assigned tasks',
    created_at: '2025-01-05'
  },
  {
    id: 'sh-2',
    shift_number: 'SHF-2025-XYZ789',
    employee_id: 'emp-2',
    employee_name: 'Jordan Lee',
    employee_email: 'jordan.lee@erp.local',
    date: '2025-01-08',
    start_time: '12:00',
    end_time: '20:00',
    break_duration_minutes: 60,
    total_hours: 7.0,
    role: 'Customer Support',
    department: 'CUSTOMER_SERVICE',
    job_title: 'Customer Service Representative',
    location: 'Office - Floor 2',
    shift_type: 'REGULAR',
    status: 'IN_PROGRESS',
    is_overtime: false,
    scheduled_by: 'HR Manager',
    approved_by: 'Customer Service Manager',
    clock_in_time: '12:00',
    attendance_status: 'ON_TIME',
    assigned_tasks: ['Handle customer calls', 'Process returns', 'Update CRM'],
    hourly_rate: 16.00,
    currency: 'USD',
    notes: 'Evening shift coverage',
    created_at: '2025-01-05'
  },
  {
    id: 'sh-3',
    shift_number: 'SHF-2025-DEF456',
    employee_id: 'emp-3',
    employee_name: 'Sarah Johnson',
    employee_email: 'sarah.johnson@erp.local',
    date: '2025-01-09',
    start_time: '09:00',
    end_time: '17:00',
    break_duration_minutes: 45,
    total_hours: 7.25,
    role: 'Sales Manager',
    erp_role: 'SALES_MANAGER',
    department: 'SALES',
    job_title: 'Sales Manager',
    location: 'Sales Office',
    shift_type: 'REGULAR',
    status: 'SCHEDULED',
    is_overtime: false,
    scheduled_by: 'HR Manager',
    assigned_tasks: ['Team meeting', 'Client presentations', 'Sales reporting'],
    hourly_rate: 35.00,
    currency: 'USD',
    notes: 'Regular business hours',
    created_at: '2025-01-06'
  },
  {
    id: 'sh-4',
    shift_number: 'SHF-2025-GHI789',
    employee_id: 'emp-1',
    employee_name: 'Alex Rivera',
    employee_email: 'alex.rivera@erp.local',
    date: '2025-01-10',
    start_time: '16:00',
    end_time: '22:00',
    break_duration_minutes: 30,
    total_hours: 5.5,
    role: 'Warehouse Associate',
    erp_role: 'WAREHOUSE_OPERATOR',
    department: 'WAREHOUSE',
    job_title: 'Warehouse Operator',
    location: 'Main Warehouse',
    shift_type: 'OVERTIME',
    status: 'SCHEDULED',
    is_overtime: true,
    scheduled_by: 'Operations Manager',
    hourly_rate: 18.50,
    overtime_hours: 5.5,
    overtime_rate: 27.75,
    total_pay: 152.63,
    currency: 'USD',
    notes: 'Overtime for peak season',
    created_at: '2025-01-07'
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



