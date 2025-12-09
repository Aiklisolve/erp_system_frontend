import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { Customer, ErpUser, Leave, Task } from '../types';

const USE_BACKEND_API = true; // Use backend API by default
let useStatic = !hasSupabaseConfig;

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Acme Retail Co.',
    email: 'ops@acmeretail.example',
    phone: '+1 555-1000',
    segment: 'Enterprise',
    created_at: '2024-11-01'
  },
  {
    id: 'cust-2',
    name: 'Northwind Traders',
    email: 'info@northwind.example',
    phone: '+1 555-1100',
    segment: 'Mid-market',
    created_at: '2024-12-10'
  }
];

// Mock ERP Users
const mockErpUsers: ErpUser[] = [
  {
    id: 'user-001',
    employee_number: 'EMP-2025-001',
    username: 'sarah.johnson',
    email: 'sarah.johnson@orbitrp.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    full_name: 'Sarah Johnson',
    gender: 'FEMALE',
    age: 35,
    mobile: '+1-555-1001',
    work_phonenumber: '+1-555-1002',
    address: '123 Business St, New York, NY',
    role: 'ADMIN',
    designation: 'System Administrator',
    department: 'IT',
    employment_status: 'ACTIVE',
    joining_date: '2023-01-15',
    manager_name: 'CEO',
    emergency_contact: '+1-555-1003',
    is_active: true,
    created_at: '2023-01-15'
  },
  {
    id: 'user-002',
    employee_number: 'EMP-2025-002',
    username: 'mike.wilson',
    email: 'mike.wilson@orbitrp.com',
    first_name: 'Mike',
    last_name: 'Wilson',
    full_name: 'Mike Wilson',
    gender: 'MALE',
    age: 42,
    mobile: '+1-555-2001',
    work_phonenumber: '+1-555-2002',
    address: '456 Corporate Ave, Chicago, IL',
    role: 'FINANCE_MANAGER',
    designation: 'Finance Manager',
    department: 'Finance',
    employment_status: 'ACTIVE',
    joining_date: '2022-06-01',
    manager_name: 'Sarah Johnson',
    emergency_contact: '+1-555-2003',
    is_active: true,
    created_at: '2022-06-01'
  },
  {
    id: 'user-003',
    employee_number: 'EMP-2025-003',
    username: 'lisa.anderson',
    email: 'lisa.anderson@orbitrp.com',
    first_name: 'Lisa',
    last_name: 'Anderson',
    full_name: 'Lisa Anderson',
    gender: 'FEMALE',
    age: 29,
    mobile: '+1-555-3001',
    address: '789 Office Park, Detroit, MI',
    role: 'INVENTORY_MANAGER',
    designation: 'Inventory Manager',
    department: 'Warehouse',
    employment_status: 'ACTIVE',
    joining_date: '2023-09-15',
    manager_name: 'Operations Director',
    emergency_contact: '+1-555-3002',
    is_active: true,
    created_at: '2023-09-15'
  }
];

function nextId() {
  return `cust-${Math.random().toString(36).slice(2, 8)}`;
}

function nextUserId() {
  return `user-${Math.random().toString(36).slice(2, 8)}`;
}

function nextLeaveId() {
  return `leave-${Math.random().toString(36).slice(2, 8)}`;
}

// Mock Leaves
const mockLeaves: Leave[] = [
  {
    id: 'leave-001',
    leave_number: 'LV-2025-001',
    employee_id: 'user-002',
    employee_number: 'EMP-2025-002',
    employee_name: 'Mike Wilson',
    employee_email: 'mike.wilson@orbitrp.com',
    employee_role: 'FINANCE_MANAGER',
    leave_type: 'ANNUAL_LEAVE',
    start_date: '2025-02-10',
    end_date: '2025-02-14',
    total_days: 5,
    reason: 'Family vacation',
    status: 'APPROVED',
    applied_date: '2025-01-15',
    approved_by: 'Sarah Johnson',
    approved_by_id: 'user-001',
    approved_date: '2025-01-16',
    emergency_contact_name: 'Lisa Wilson',
    emergency_contact_phone: '+1-555-2003',
    created_at: '2025-01-15'
  },
  {
    id: 'leave-002',
    leave_number: 'LV-2025-002',
    employee_id: 'user-003',
    employee_number: 'EMP-2025-003',
    employee_name: 'Lisa Anderson',
    employee_email: 'lisa.anderson@orbitrp.com',
    employee_role: 'INVENTORY_MANAGER',
    leave_type: 'SICK_LEAVE',
    start_date: '2025-01-20',
    end_date: '2025-01-22',
    total_days: 3,
    reason: 'Medical appointment and recovery',
    status: 'PENDING',
    applied_date: '2025-01-18',
    emergency_contact_name: 'Tom Anderson',
    emergency_contact_phone: '+1-555-3002',
    notes: 'Doctor appointment on 20th, recovery days 21st-22nd',
    created_at: '2025-01-18'
  },
  {
    id: 'leave-003',
    leave_number: 'LV-2025-003',
    employee_id: 'user-001',
    employee_number: 'EMP-2025-001',
    employee_name: 'Sarah Johnson',
    employee_email: 'sarah.johnson@orbitrp.com',
    employee_role: 'ADMIN',
    leave_type: 'CASUAL_LEAVE',
    start_date: '2025-01-25',
    end_date: '2025-01-25',
    total_days: 1,
    reason: 'Personal work',
    status: 'REJECTED',
    applied_date: '2025-01-20',
    rejected_by: 'CEO',
    rejected_by_id: 'user-000',
    rejected_date: '2025-01-21',
    rejection_reason: 'Critical system maintenance scheduled',
    created_at: '2025-01-20'
  }
];

// Mock Tasks
const mockTasks: Task[] = [
  {
    id: 'task-001',
    task_number: 'TSK-2025-001',
    title: 'Update Finance Module Documentation',
    description: 'Review and update the Finance module documentation with new features and workflows',
    task_type: 'DOCUMENTATION',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assigned_to: 'user-002',
    assigned_to_name: 'Mike Wilson',
    assigned_to_email: 'mike.wilson@orbitrp.com',
    assigned_to_role: 'FINANCE_MANAGER',
    assigned_by: 'user-001',
    assigned_date: '2025-01-10',
    start_date: '2025-01-10',
    due_date: '2025-01-25',
    progress_percentage: 60,
    estimated_hours: 16,
    actual_hours: 10,
    tags: ['documentation', 'finance'],
    notes: 'Focus on new transaction approval workflow',
    created_at: '2025-01-10'
  },
  {
    id: 'task-002',
    task_number: 'TSK-2025-002',
    title: 'Fix Inventory Low Stock Alert Bug',
    description: 'Investigate and fix the bug causing incorrect low stock alerts in the inventory module',
    task_type: 'BUG',
    priority: 'HIGH',
    status: 'NEW',
    assigned_to: 'user-003',
    assigned_to_name: 'Lisa Anderson',
    assigned_to_email: 'lisa.anderson@orbitrp.com',
    assigned_to_role: 'INVENTORY_MANAGER',
    assigned_by: 'user-001',
    assigned_date: '2025-01-18',
    start_date: '2025-01-20',
    due_date: '2025-01-22',
    progress_percentage: 0,
    estimated_hours: 8,
    tags: ['bug', 'inventory', 'urgent'],
    notes: 'Priority issue - affecting warehouse operations',
    created_at: '2025-01-18'
  },
  {
    id: 'task-003',
    task_number: 'TSK-2025-003',
    title: 'Implement Multi-Currency Support',
    description: 'Add support for multiple currencies in the procurement and finance modules',
    task_type: 'FEATURE',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    assigned_to: 'user-001',
    assigned_to_name: 'Sarah Johnson',
    assigned_to_email: 'sarah.johnson@orbitrp.com',
    assigned_to_role: 'ADMIN',
    assigned_by: 'CEO',
    assigned_date: '2025-01-05',
    start_date: '2025-01-05',
    due_date: '2025-01-15',
    completed_date: '2025-01-14',
    progress_percentage: 100,
    estimated_hours: 24,
    actual_hours: 22,
    tags: ['feature', 'finance', 'procurement'],
    notes: 'Completed ahead of schedule',
    created_at: '2025-01-05'
  }
];

export async function listCustomers(): Promise<Customer[]> {
  if (useStatic) return mockCustomers;

  try {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return (data as Customer[]) ?? [];
  } catch (error) {
    handleApiError('crm.listCustomers', error);
    useStatic = true;
    return mockCustomers;
  }
}

export async function createCustomer(
  payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
): Promise<Customer> {
  if (useStatic) {
    const customer: Customer = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockCustomers.unshift(customer);
    return customer;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  } catch (error) {
    handleApiError('crm.createCustomer', error);
    useStatic = true;
    return createCustomer(payload);
  }
}

export async function updateCustomer(
  id: string,
  changes: Partial<Customer>
): Promise<Customer | null> {
  if (useStatic) {
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    mockCustomers[index] = { ...mockCustomers[index], ...changes };
    return mockCustomers[index];
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  } catch (error) {
    handleApiError('crm.updateCustomer', error);
    useStatic = true;
    return updateCustomer(id, changes);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  if (useStatic) {
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index !== -1) mockCustomers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('crm.deleteCustomer', error);
    useStatic = true;
    await deleteCustomer(id);
  }
}

// ============================================
// ERP USERS API
// ============================================

export async function listErpUsers(): Promise<ErpUser[]> {
  if (useStatic) return mockErpUsers;

  try {
    const { data, error } = await supabase.from('erp_users').select('*');
    if (error) throw error;
    return (data as ErpUser[]) ?? [];
  } catch (error) {
    handleApiError('crm.listErpUsers', error);
    useStatic = true;
    return mockErpUsers;
  }
}

export async function createErpUser(
  payload: Omit<ErpUser, 'id' | 'created_at' | 'updated_at'>
): Promise<ErpUser> {
  if (useStatic) {
    const user: ErpUser = {
      ...payload,
      id: nextUserId(),
      created_at: new Date().toISOString()
    };
    mockErpUsers.unshift(user);
    return user;
  }

  try {
    const { data, error } = await supabase
      .from('erp_users')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ErpUser;
  } catch (error) {
    handleApiError('crm.createErpUser', error);
    useStatic = true;
    return createErpUser(payload);
  }
}

export async function updateErpUser(
  id: string,
  changes: Partial<ErpUser>
): Promise<ErpUser | null> {
  if (useStatic) {
    const index = mockErpUsers.findIndex((u) => u.id === id);
    if (index === -1) return null;
    mockErpUsers[index] = { ...mockErpUsers[index], ...changes };
    return mockErpUsers[index];
  }

  try {
    const { data, error } = await supabase
      .from('erp_users')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ErpUser;
  } catch (error) {
    handleApiError('crm.updateErpUser', error);
    useStatic = true;
    return updateErpUser(id, changes);
  }
}

export async function deleteErpUser(id: string): Promise<void> {
  if (useStatic) {
    const index = mockErpUsers.findIndex((u) => u.id === id);
    if (index !== -1) mockErpUsers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('erp_users').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('crm.deleteErpUser', error);
    useStatic = true;
    await deleteErpUser(id);
  }
}

// ============================================
// LEAVE MANAGEMENT API
// ============================================

export async function listLeaves(): Promise<Leave[]> {
  if (useStatic) return mockLeaves;

  try {
    const { data, error } = await supabase.from('employee_leaves').select('*');
    if (error) throw error;
    return (data as Leave[]) ?? [];
  } catch (error) {
    handleApiError('crm.listLeaves', error);
    useStatic = true;
    return mockLeaves;
  }
}

export async function createLeave(
  payload: Omit<Leave, 'id' | 'created_at' | 'updated_at'>
): Promise<Leave> {
  if (useStatic) {
    const leave: Leave = {
      ...payload,
      id: nextLeaveId(),
      created_at: new Date().toISOString()
    };
    mockLeaves.unshift(leave);
    return leave;
  }

  try {
    const { data, error } = await supabase
      .from('employee_leaves')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Leave;
  } catch (error) {
    handleApiError('crm.createLeave', error);
    useStatic = true;
    return createLeave(payload);
  }
}

export async function updateLeave(
  id: string,
  changes: Partial<Leave>
): Promise<Leave | null> {
  if (useStatic) {
    const index = mockLeaves.findIndex((l) => l.id === id);
    if (index === -1) return null;
    mockLeaves[index] = { ...mockLeaves[index], ...changes };
    return mockLeaves[index];
  }

  try {
    const { data, error } = await supabase
      .from('employee_leaves')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Leave;
  } catch (error) {
    handleApiError('crm.updateLeave', error);
    useStatic = true;
    return updateLeave(id, changes);
  }
}

export async function deleteLeave(id: string): Promise<void> {
  if (useStatic) {
    const index = mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) mockLeaves.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('employee_leaves').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('crm.deleteLeave', error);
    useStatic = true;
    await deleteLeave(id);
  }
}

// ============================================
// TASK MANAGEMENT API
// ============================================

function nextTaskId() {
  return `task-${Math.random().toString(36).slice(2, 8)}`;
}

// Map backend task response to frontend Task type
function mapBackendTask(backendTask: any): Task {
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return '';
  };

  const formatArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return {
    id: backendTask.id?.toString() || backendTask.task_id?.toString() || nextTaskId(),
    task_number: backendTask.task_number || backendTask.task_id?.toString() || null,
    title: backendTask.title || '',
    description: backendTask.description || undefined,
    task_type: backendTask.task_type || backendTask.type || 'OTHER',
    priority: backendTask.priority || 'MEDIUM',
    status: backendTask.status || 'NEW',
    
    // Assignment
    assigned_to: backendTask.assigned_to?.toString() || backendTask.assigned_to_id?.toString() || '',
    assigned_to_name: backendTask.assigned_to_name || 
      backendTask.assigned_to_user?.full_name || 
      backendTask.assigned_to_user?.name ||
      (backendTask.assigned_to_user?.first_name && backendTask.assigned_to_user?.last_name
        ? `${backendTask.assigned_to_user.first_name} ${backendTask.assigned_to_user.last_name}`.trim()
        : undefined) ||
      '',
    assigned_to_email: backendTask.assigned_to_email || backendTask.assigned_to_user?.email || undefined,
    assigned_to_role: backendTask.assigned_to_role || backendTask.assigned_to_user?.role || undefined,
    assigned_by: backendTask.assigned_by?.toString() || backendTask.assigned_by_id?.toString() || backendTask.assigned_by_user?.id?.toString() || backendTask.assigned_by_user?.full_name || undefined,
    assigned_date: formatDate(backendTask.assigned_date || backendTask.assigned_at),
    
    // Approval (optional fields - may not exist in Task type)
    ...(backendTask.approved_by_id || backendTask.approved_by_user?.id ? {
      approved_by_id: backendTask.approved_by_id?.toString() || backendTask.approved_by_user?.id?.toString()
    } : {}),
    ...(backendTask.approved_by || backendTask.approved_by_user?.full_name ? {
      approved_by: backendTask.approved_by || backendTask.approved_by_user?.full_name
    } : {}),
    ...(backendTask.approved_date || backendTask.approved_at ? {
      approved_date: formatDate(backendTask.approved_date || backendTask.approved_at)
    } : {}),
    
    // Dates
    start_date: formatDate(backendTask.start_date),
    due_date: formatDate(backendTask.due_date),
    completed_date: formatDate(backendTask.completed_date || backendTask.completed_at),
    
    // Progress
    progress_percentage: backendTask.progress_percentage ? parseFloat(backendTask.progress_percentage) : undefined,
    estimated_hours: backendTask.estimated_hours ? parseFloat(backendTask.estimated_hours) : undefined,
    actual_hours: backendTask.actual_hours ? parseFloat(backendTask.actual_hours) : undefined,
    
    // Additional
    tags: formatArray(backendTask.tags),
    notes: backendTask.notes || undefined,
    attachments: formatArray(backendTask.attachments),
    
    created_at: backendTask.created_at || new Date().toISOString(),
    updated_at: backendTask.updated_at || new Date().toISOString(),
  };
}

export async function listTasks(): Promise<Task[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching tasks from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { tasks: any[]; pagination?: any } } | { tasks: any[] } | any[]>(
        '/tasks?page=1&limit=1000'
      );

      console.log('📋 Backend tasks response:', response);

      // Handle different response formats
      let tasks = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.tasks) {
          tasks = response.data.tasks;
        } else if ('tasks' in response) {
          tasks = response.tasks;
        } else if (Array.isArray(response)) {
          tasks = response;
        }
      }

      if (tasks.length > 0) {
        const mapped = tasks.map(mapBackendTask);
        console.log('✅ Mapped tasks:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No tasks in response, falling back to mock data');
      return mockTasks;
    } catch (error) {
      console.error('❌ Backend API error fetching tasks:', error);
      return mockTasks;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) return mockTasks;

  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return (data as Task[]) ?? [];
  } catch (error) {
    handleApiError('crm.listTasks', error);
    useStatic = true;
    return mockTasks;
  }
}

export async function createTask(
  payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  if (USE_BACKEND_API) {
    try {
      // Transform payload for backend: convert assigned_to_id to assigned_to and assigned_by_id to assigned_by
      const backendPayload: any = { ...payload };
      if (backendPayload.assigned_to_id && !backendPayload.assigned_to) {
        backendPayload.assigned_to = backendPayload.assigned_to_id;
        delete backendPayload.assigned_to_id;
      }
      // Ensure assigned_to is set (use assigned_to_id if assigned_to doesn't exist)
      if (!backendPayload.assigned_to && (payload as any).assigned_to_id) {
        backendPayload.assigned_to = (payload as any).assigned_to_id;
      }
      // Convert assigned_by_id to assigned_by
      if (backendPayload.assigned_by_id && !backendPayload.assigned_by) {
        backendPayload.assigned_by = backendPayload.assigned_by_id;
        delete backendPayload.assigned_by_id;
      }
      // Ensure assigned_by is set (use assigned_by_id if assigned_by doesn't exist)
      if (!backendPayload.assigned_by && (payload as any).assigned_by_id) {
        backendPayload.assigned_by = (payload as any).assigned_by_id;
      }
      
      console.log('🔄 Creating task via backend API...', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: { task: any } } | { task: any } | any>(
        '/tasks',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('✅ Backend create task response:', response);

      let task = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.task) {
          task = response.data.task;
        } else if ('task' in response) {
          task = response.task;
        } else if (!('success' in response)) {
          task = response;
        }
      }

      if (task) {
        const mapped = mapBackendTask(task);
        console.log('✅ Created task:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error creating task:', error);
      // Fallback to mock
      const task: Task = {
        ...payload,
        id: nextTaskId(),
        created_at: new Date().toISOString()
      };
      mockTasks.unshift(task);
      return task;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const task: Task = {
      ...payload,
      id: nextTaskId(),
      created_at: new Date().toISOString()
    };
    mockTasks.unshift(task);
    return task;
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  } catch (error) {
    handleApiError('crm.createTask', error);
    useStatic = true;
    return createTask(payload);
  }
}

export async function updateTask(
  id: string,
  changes: Partial<Task>
): Promise<Task | null> {
  if (USE_BACKEND_API) {
    try {
      // Transform payload for backend: convert assigned_to_id to assigned_to and assigned_by_id to assigned_by
      const backendPayload: any = { ...changes };
      if (backendPayload.assigned_to_id && !backendPayload.assigned_to) {
        backendPayload.assigned_to = backendPayload.assigned_to_id;
        delete backendPayload.assigned_to_id;
      }
      // Ensure assigned_to is set (use assigned_to_id if assigned_to doesn't exist)
      if (!backendPayload.assigned_to && (changes as any).assigned_to_id) {
        backendPayload.assigned_to = (changes as any).assigned_to_id;
      }
      // Convert assigned_by_id to assigned_by
      if (backendPayload.assigned_by_id && !backendPayload.assigned_by) {
        backendPayload.assigned_by = backendPayload.assigned_by_id;
        delete backendPayload.assigned_by_id;
      }
      // Ensure assigned_by is set (use assigned_by_id if assigned_by doesn't exist)
      if (!backendPayload.assigned_by && (changes as any).assigned_by_id) {
        backendPayload.assigned_by = (changes as any).assigned_by_id;
      }
      
      console.log('🔄 Updating task via backend API...', id, backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: { task: any } } | { task: any } | any>(
        `/tasks/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('✅ Backend update task response:', response);

      let task = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.task) {
          task = response.data.task;
        } else if ('task' in response) {
          task = response.task;
        } else if (!('success' in response)) {
          task = response;
        }
      }

      if (task) {
        const mapped = mapBackendTask(task);
        console.log('✅ Updated task:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error updating task:', error);
      // Fallback to mock
      const index = mockTasks.findIndex((t) => t.id === id);
      if (index === -1) return null;
      mockTasks[index] = { ...mockTasks[index], ...changes };
      return mockTasks[index];
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    mockTasks[index] = { ...mockTasks[index], ...changes };
    return mockTasks[index];
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  } catch (error) {
    handleApiError('crm.updateTask', error);
    useStatic = true;
    return updateTask(id, changes);
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting task via backend API...', id);
      
      await apiRequest(
        `/tasks/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('✅ Deleted task:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting task:', error);
      // Fallback to mock
      const index = mockTasks.findIndex((t) => t.id === id);
      if (index !== -1) mockTasks.splice(index, 1);
      return;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index !== -1) mockTasks.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('crm.deleteTask', error);
    useStatic = true;
    await deleteTask(id);
  }
}

