import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { Shift } from '../types';

const USE_BACKEND_API = true; // Use backend API by default
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

// Map backend shift response to frontend Shift type
function mapBackendShift(backendShift: any): Shift {
  // Handle date formatting
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      // If it's ISO format, extract date part
      if (date.includes('T')) return date.split('T')[0];
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  // Handle time formatting
  const formatTime = (time: string | Date | null | undefined): string => {
    if (!time) return '';
    if (typeof time === 'string') {
      // If it's already in HH:mm format, return as is
      if (/^\d{2}:\d{2}$/.test(time)) return time;
      // If it's ISO format with time, extract time part
      if (time.includes('T')) {
        const timePart = time.split('T')[1]?.split('.')[0]?.substring(0, 5);
        return timePart || '';
      }
      return time;
    }
    if (time instanceof Date) {
      return time.toTimeString().substring(0, 5);
    }
    return '';
  };

  return {
    id: backendShift.id?.toString() || backendShift.shift_id?.toString() || nextId(),
    shift_number: backendShift.shift_number || backendShift.shift_id?.toString() || null,
    employee_id: backendShift.employee_id?.toString() || null,
    employee_name: backendShift.employee_name || backendShift.employee?.name || backendShift.employee?.full_name || 'Unknown Employee',
    employee_email: backendShift.employee_email || backendShift.employee?.email || null,
    date: formatDate(backendShift.date),
    start_time: formatTime(backendShift.start_time) || '08:00',
    end_time: formatTime(backendShift.end_time) || '16:00',
    break_duration_minutes: backendShift.break_duration_minutes || backendShift.break_duration || 0,
    total_hours: backendShift.total_hours !== undefined && backendShift.total_hours !== null
      ? (typeof backendShift.total_hours === 'number' ? backendShift.total_hours : parseFloat(String(backendShift.total_hours)) || null)
      : (backendShift.total_hours_worked !== undefined && backendShift.total_hours_worked !== null
          ? (typeof backendShift.total_hours_worked === 'number' ? backendShift.total_hours_worked : parseFloat(String(backendShift.total_hours_worked)) || null)
          : null),
    role: backendShift.role || backendShift.job_title || backendShift.position || 'Unknown Role',
    erp_role: backendShift.erp_role || backendShift.erp_role_name || null,
    department: backendShift.department || null,
    job_title: backendShift.job_title || backendShift.role || null,
    location: backendShift.location || backendShift.work_location || null,
    shift_type: backendShift.shift_type || 'REGULAR',
    status: backendShift.status || 'SCHEDULED',
    is_overtime: backendShift.is_overtime || backendShift.overtime || false,
    scheduled_by: backendShift.scheduled_by || backendShift.scheduled_by_name || null,
    approved_by: backendShift.approved_by || backendShift.approved_by_name || null,
    approval_date: formatDate(backendShift.approval_date),
    clock_in_time: formatTime(backendShift.clock_in_time),
    clock_out_time: formatTime(backendShift.clock_out_time),
    actual_hours: backendShift.actual_hours !== undefined && backendShift.actual_hours !== null
      ? (typeof backendShift.actual_hours === 'number' ? backendShift.actual_hours : parseFloat(String(backendShift.actual_hours)) || null)
      : (backendShift.actual_hours_worked !== undefined && backendShift.actual_hours_worked !== null
          ? (typeof backendShift.actual_hours_worked === 'number' ? backendShift.actual_hours_worked : parseFloat(String(backendShift.actual_hours_worked)) || null)
          : null),
    attendance_status: backendShift.attendance_status || null,
    late_minutes: backendShift.late_minutes || null,
    early_leave_minutes: backendShift.early_leave_minutes || null,
    assigned_tasks: Array.isArray(backendShift.assigned_tasks) 
      ? backendShift.assigned_tasks 
      : (backendShift.assigned_tasks ? [backendShift.assigned_tasks] : []),
    task_completion_rate: backendShift.task_completion_rate || backendShift.completion_rate || null,
    notes: backendShift.notes || null,
    performance_rating: backendShift.performance_rating || null,
    quality_score: backendShift.quality_score || null,
    hourly_rate: backendShift.hourly_rate ? parseFloat(backendShift.hourly_rate) : null,
    total_pay: backendShift.total_pay !== undefined && backendShift.total_pay !== null
      ? (typeof backendShift.total_pay === 'number' ? backendShift.total_pay : parseFloat(String(backendShift.total_pay)) || null)
      : null,
    overtime_hours: backendShift.overtime_hours ? parseFloat(backendShift.overtime_hours) : null,
    overtime_rate: backendShift.overtime_rate ? parseFloat(backendShift.overtime_rate) : null,
    currency: backendShift.currency || 'USD',
    tags: Array.isArray(backendShift.tags) ? backendShift.tags : null,
    internal_notes: backendShift.internal_notes || null,
    created_at: backendShift.created_at || new Date().toISOString(),
    updated_at: backendShift.updated_at || new Date().toISOString(),
  };
}

export async function listShifts(): Promise<Shift[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching shifts from backend API...');
      const response = await apiRequest<{ success: boolean; data: { shifts: any[]; pagination?: any } } | { shifts: any[] } | any[]>(
        '/workforce/shifts?page=1&limit=100'
      );

      console.log('📦 Backend shifts response:', response);

      // Handle different response formats
      let shifts = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.shifts) {
          shifts = response.data.shifts;
        } else if ('shifts' in response) {
          shifts = response.shifts;
        } else if (Array.isArray(response)) {
          shifts = response;
        }
      }

      if (shifts.length > 0) {
        const mapped = shifts.map(mapBackendShift);
        console.log('✅ Mapped shifts:', mapped.length);
        console.log('📊 Sample shift statuses:', mapped.slice(0, 5).map(s => ({ id: s.id, status: s.status, shift_type: s.shift_type, employee: s.employee_name })));
        return mapped;
      }

      console.log('⚠️ No shifts in response, using mock data');
      return mockShifts;
    } catch (error) {
      console.error('❌ Backend API error, falling back to mock data:', error);
      return mockShifts;
    }
  }

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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating shift via backend API...', payload);
      console.log('📋 Attendance status in payload:', payload.attendance_status);
      
      const response = await apiRequest<{ success: boolean; data: { shift: any } } | { shift: any } | any>(
        '/workforce/shifts',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      console.log('📦 Backend create shift response:', response);

      // Handle different response formats
      let shiftData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.shift) {
          shiftData = response.data.shift;
        } else if ('shift' in response) {
          shiftData = response.shift;
        } else if (!Array.isArray(response)) {
          shiftData = response;
        }
      }

      if (shiftData) {
        const mapped = mapBackendShift(shiftData);
        console.log('✅ Created shift:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error creating shift:', error);
      // Fall through to mock data
    }
  }

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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating shift via backend API...', { id, changes });
      console.log('📋 Attendance status in changes:', changes.attendance_status);
      
      const response = await apiRequest<{ success: boolean; data: { shift: any } } | { shift: any } | any>(
        `/workforce/shifts/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(changes),
        }
      );

      console.log('📦 Backend update shift response:', response);

      // Handle different response formats
      let shiftData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.shift) {
          shiftData = response.data.shift;
        } else if ('shift' in response) {
          shiftData = response.shift;
        } else if (!Array.isArray(response)) {
          shiftData = response;
        }
      }

      if (shiftData) {
        const mapped = mapBackendShift(shiftData);
        console.log('✅ Updated shift:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error updating shift:', error);
      // Fall through to mock data
    }
  }

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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting shift via backend API...', { id });
      
      await apiRequest<{ success: boolean; message?: string }>(
        `/workforce/shifts/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('✅ Deleted shift:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting shift:', error);
      // Fall through to mock data
    }
  }

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



