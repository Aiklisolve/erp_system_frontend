import { apiRequest } from '../../../config/api';
import { handleApiError } from '../../../lib/errorHandler';
import type { Customer, ErpUser, Leave, Task } from '../types';

// Flag to use mock data if backend API is unavailable
let useStatic = false;

// Reset function to force API calls again (useful for debugging)
export function resetStaticMode() {
  useStatic = false;
  console.log('🔄 Static mode reset - will try backend API again');
}

// Make reset function available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).resetCrmStaticMode = resetStaticMode;
  console.log('💡 Debug helper: Call window.resetCrmStaticMode() to reset static mode');
}

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

function nextTaskId() {
  return `task-${Math.random().toString(36).slice(2, 8)}`;
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
    assigned_to_id: 'user-002',
    assigned_to_name: 'Mike Wilson',
    assigned_to_email: 'mike.wilson@orbitrp.com',
    assigned_to_role: 'FINANCE_MANAGER',
    assigned_by: 'Sarah Johnson',
    assigned_by_id: 'user-001',
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
    assigned_to_id: 'user-003',
    assigned_to_name: 'Lisa Anderson',
    assigned_to_email: 'lisa.anderson@orbitrp.com',
    assigned_to_role: 'INVENTORY_MANAGER',
    assigned_by: 'Sarah Johnson',
    assigned_by_id: 'user-001',
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
    assigned_to_id: 'user-001',
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
  console.log('🔍 listCustomers called, useStatic:', useStatic);
  
  if (useStatic) {
    console.log('📦 Using static/mock data (useStatic flag is true)');
    console.log('💡 To reset and try backend API again, call resetStaticMode() in console');
    return mockCustomers;
  }

  try {
    console.log('🔄 Fetching customers from backend API...');
    
    // Try to fetch all customers with pagination support
    // First, try with a high limit to get all customers at once
    let response = await apiRequest<any>('/customers?page=1&limit=1000');
    
    console.log('📦 Raw API response:', JSON.stringify(response, null, 2));
    console.log('📦 Response type:', typeof response);
    console.log('📦 Is array?', Array.isArray(response));
    console.log('📦 Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');

    // Handle different response formats
    let customers: Customer[] = [];
    let pagination: any = null;
    
    // Case 1: Direct array
    if (Array.isArray(response)) {
      customers = response;
      console.log('✅ Response is direct array, customers:', customers.length);
    }
    // Case 2: { data: [...] } or { data: { customers: [...], pagination: {...} } }
    else if (response && typeof response === 'object' && 'data' in response) {
      if (Array.isArray(response.data)) {
        customers = response.data;
        console.log('✅ Response has data array, customers:', customers.length);
      } else if (response.data && typeof response.data === 'object') {
        // Handle nested structure like { data: { customers: [...], pagination: {...} } }
        if ('customers' in response.data) {
          customers = Array.isArray(response.data.customers) ? response.data.customers : [];
          pagination = response.data.pagination || null;
          console.log('✅ Response has nested customers array, customers:', customers.length);
          if (pagination) {
            console.log('📄 Pagination info:', pagination);
          }
        } else if ('data' in response.data && Array.isArray(response.data.data)) {
          customers = response.data.data;
        }
      }
    }
    // Case 3: { success: true, data: [...] } or { success: true, data: { customers: [...], pagination: {...} } }
    else if (response && typeof response === 'object' && 'success' in response) {
      if (response.success && 'data' in response) {
        if (Array.isArray(response.data)) {
          customers = response.data;
        } else if (response.data && typeof response.data === 'object') {
          if ('customers' in response.data) {
            customers = Array.isArray(response.data.customers) ? response.data.customers : [];
            pagination = response.data.pagination || null;
          } else if ('data' in response.data && Array.isArray(response.data.data)) {
            customers = response.data.data;
          }
        }
        console.log('✅ Response has success wrapper, customers:', customers.length);
        if (pagination) {
          console.log('📄 Pagination info:', pagination);
        }
      }
    }
    // Case 4: { customers: [...] }
    else if (response && typeof response === 'object' && 'customers' in response) {
      customers = Array.isArray(response.customers) ? response.customers : [];
      pagination = response.pagination || null;
      console.log('✅ Response has customers key, customers:', customers.length);
      if (pagination) {
        console.log('📄 Pagination info:', pagination);
      }
    }

    // If pagination exists and there are more pages, fetch all pages
    if (pagination && pagination.total_pages > 1 && pagination.current_page < pagination.total_pages) {
      console.log(`📄 Fetching additional pages: ${pagination.current_page + 1} to ${pagination.total_pages}`);
      const allCustomers = [...customers];
      
      // Fetch remaining pages
      for (let page = 2; page <= pagination.total_pages; page++) {
        try {
          const pageResponse = await apiRequest<any>(`/customers?page=${page}&limit=1000`);
          
          let pageCustomers: Customer[] = [];
          
          // Parse page response using same logic
          if (Array.isArray(pageResponse)) {
            pageCustomers = pageResponse;
          } else if (pageResponse && typeof pageResponse === 'object' && 'data' in pageResponse) {
            if (Array.isArray(pageResponse.data)) {
              pageCustomers = pageResponse.data;
            } else if (pageResponse.data && typeof pageResponse.data === 'object' && 'customers' in pageResponse.data) {
              pageCustomers = Array.isArray(pageResponse.data.customers) ? pageResponse.data.customers : [];
            }
          } else if (pageResponse && typeof pageResponse === 'object' && 'success' in pageResponse && pageResponse.success && 'data' in pageResponse) {
            if (Array.isArray(pageResponse.data)) {
              pageCustomers = pageResponse.data;
            } else if (pageResponse.data && typeof pageResponse.data === 'object' && 'customers' in pageResponse.data) {
              pageCustomers = Array.isArray(pageResponse.data.customers) ? pageResponse.data.customers : [];
            }
          } else if (pageResponse && typeof pageResponse === 'object' && 'customers' in pageResponse) {
            pageCustomers = Array.isArray(pageResponse.customers) ? pageResponse.customers : [];
          }
          
          allCustomers.push(...pageCustomers);
          console.log(`✅ Fetched page ${page}, customers: ${pageCustomers.length}, total: ${allCustomers.length}`);
        } catch (pageError) {
          console.error(`❌ Error fetching page ${page}:`, pageError);
          // Continue with what we have
          break;
        }
      }
      
      customers = allCustomers;
      console.log(`✅ Fetched all pages, total customers: ${customers.length}`);
    }

    // Normalize customer data to ensure all fields have default values
    const normalizedCustomers = customers.map((customer) => ({
      ...customer,
      customer_number: customer.customer_number || '',
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      segment: customer.segment || '',
      company_name: customer.company_name || '',
      industry: customer.industry || '',
      annual_revenue: customer.annual_revenue || undefined,
      employee_count: customer.employee_count || undefined,
      website: customer.website || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || '',
      pincode: customer.pincode || '',
      gstin: customer.gstin || '',
      pan_number: customer.pan_number || '',
      contact_person: customer.contact_person || '',
      contact_designation: customer.contact_designation || '',
      credit_limit: customer.credit_limit || undefined,
      payment_terms: customer.payment_terms || '',
      notes: customer.notes || '',
      id: customer.id || '',
      created_at: customer.created_at || new Date().toISOString(),
      updated_at: customer.updated_at || customer.created_at || new Date().toISOString()
    }));

    // Return customers even if empty array (backend might legitimately have no customers)
    console.log('✅ Returning customers from backend:', normalizedCustomers.length);
    return normalizedCustomers;
    
  } catch (error: any) {
    console.error('❌ Backend API error fetching customers:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      stack: error?.stack,
      response: error?.response
    });
    
    // Only set useStatic if it's a network/connection error, not a data format issue
    if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
      console.warn('⚠️ Network error detected, falling back to mock data');
      useStatic = true;
    }
    
    handleApiError('crm.listCustomers', error);
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
    console.log('🔄 Creating customer via backend API...');
    const response = await apiRequest<Customer | { success: boolean; data: Customer }>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    // Handle different response formats
    let customer: Customer;
    if (response && typeof response === 'object' && 'id' in response) {
      customer = response as Customer;
    } else if (response && typeof response === 'object' && 'data' in response) {
      customer = response.data as Customer;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('✅ Customer created successfully:', customer.id);
    return customer;
  } catch (error) {
    console.error('❌ Backend API error creating customer:', error);
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
    console.log('🔄 Updating customer via backend API...', id);
    const response = await apiRequest<Customer | { success: boolean; data: Customer }>(
      `/customers/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes)
      }
    );

    // Handle different response formats
    let customer: Customer | null = null;
    if (response && typeof response === 'object' && 'id' in response) {
      customer = response as Customer;
    } else if (response && typeof response === 'object' && 'data' in response) {
      customer = response.data as Customer;
    }

    if (customer) {
      console.log('✅ Customer updated successfully:', customer.id);
      return customer;
    }

    return null;
  } catch (error) {
    console.error('❌ Backend API error updating customer:', error);
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
    console.log('🔄 Deleting customer via backend API...', id);
    await apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
    console.log('✅ Customer deleted successfully:', id);
  } catch (error) {
    console.error('❌ Backend API error deleting customer:', error);
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
    console.log('🔄 Fetching ERP users from backend API...');
    const response = await apiRequest<ErpUser[] | { success: boolean; data: ErpUser[] }>(
      '/erp-users'
    );

    // Handle different response formats
    let users: ErpUser[] = [];
    if (Array.isArray(response)) {
      users = response;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      users = response.data;
    } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
      users = Array.isArray(response.data) ? response.data : [];
    }

    // Normalize user data to ensure all fields have default values
    const normalizedUsers = users.map((user) => ({
      ...user,
      id: user.id ?? '',
      employee_number: user.employee_number ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      mobile: user.mobile ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      gender: user.gender ?? undefined,
      date_of_birth: user.date_of_birth ?? undefined,
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      pincode: user.pincode ?? '',
      role: user.role ?? 'EMPLOYEE',
      employment_status: user.employment_status ?? 'ACTIVE',
      joining_date: user.joining_date ?? new Date().toISOString().split('T')[0],
      designation: user.designation ?? '',
      department: user.department ?? '',
      manager_name: user.manager_name ?? '',
      manager_erp_user_id: user.manager_erp_user_id ?? undefined,
      work_phone: user.work_phone ?? '',
      salary: user.salary ?? undefined,
      emergency_contact_name: user.emergency_contact_name ?? '',
      emergency_contact_phone: user.emergency_contact_phone ?? '',
      bank_account_number: user.bank_account_number ?? '',
      bank_name: user.bank_name ?? '',
      bank_ifsc: user.bank_ifsc ?? '',
      pan_number: user.pan_number ?? '',
      aadhar_number: user.aadhar_number ?? '',
      notes: user.notes ?? '',
      created_at: user.created_at ?? new Date().toISOString(),
      updated_at: user.updated_at ?? user.created_at ?? new Date().toISOString()
    }));

    if (normalizedUsers.length > 0) {
      console.log('✅ ERP users loaded successfully:', normalizedUsers.length);
      return normalizedUsers;
    }

    console.log('⚠️ No ERP users in response, using mock data');
    return mockErpUsers;
  } catch (error) {
    console.error('❌ Backend API error fetching ERP users:', error);
    handleApiError('crm.listErpUsers', error);
    useStatic = true;
    return mockErpUsers;
  }
}

export async function createErpUser(
  payload: Omit<ErpUser, 'id' | 'created_at' | 'updated_at' | 'password_hash'>
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
    console.log('🔄 Creating ERP user via backend API...');
    const response = await apiRequest<ErpUser | { success: boolean; data: ErpUser }>(
      '/erp-users',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    // Handle different response formats
    let user: ErpUser;
    if (response && typeof response === 'object' && 'id' in response) {
      user = response as ErpUser;
    } else if (response && typeof response === 'object' && 'data' in response) {
      user = response.data as ErpUser;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('✅ ERP user created successfully:', user.id);
    return user;
  } catch (error) {
    console.error('❌ Backend API error creating ERP user:', error);
    handleApiError('crm.createErpUser', error);
    useStatic = true;
    return createErpUser(payload);
  }
}

// Fetch employee data by employee_number to get salary, emergency contact, bank details
export async function getEmployeeByEmployeeNumber(employeeNumber: string): Promise<any | null> {
  if (useStatic) return null;

  try {
    console.log('🔄 Fetching employee data for employee_number:', employeeNumber);
    const response = await apiRequest<any>(
      `/hr/employees?employee_number=${encodeURIComponent(employeeNumber)}`
    );

    // Handle different response formats
    let employee = null;
    if (response && typeof response === 'object') {
      if ('success' in response && response.success && 'data' in response) {
        if (Array.isArray(response.data.employees) && response.data.employees.length > 0) {
          employee = response.data.employees[0];
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          employee = response.data[0];
        } else if (typeof response.data === 'object' && 'id' in response.data) {
          employee = response.data;
        }
      } else if ('employees' in response && Array.isArray(response.employees) && response.employees.length > 0) {
        employee = response.employees[0];
      } else if (Array.isArray(response) && response.length > 0) {
        employee = response[0];
      } else if ('id' in response) {
        employee = response;
      }
    }

    if (employee) {
      console.log('✅ Employee data loaded:', employee);
      return employee;
    }

    return null;
  } catch (error) {
    console.error('❌ Backend API error fetching employee data:', error);
    return null;
  }
}

// Get ERP user with employee data merged
export async function getErpUserWithEmployeeData(id: string): Promise<ErpUser | null> {
  try {
    // First get the ERP user
    const response = await apiRequest<ErpUser | { success: boolean; data: ErpUser }>(
      `/erp-users/${id}`
    );

    let user: ErpUser | null = null;
    if (response && typeof response === 'object' && 'id' in response) {
      user = response as ErpUser;
    } else if (response && typeof response === 'object' && 'data' in response) {
      user = response.data as ErpUser;
    }

    if (!user) return null;

    // If user has employee_number, fetch employee data
    if (user.employee_number) {
      const employeeData = await getEmployeeByEmployeeNumber(user.employee_number);
      if (employeeData) {
        // Merge employee data into user data
        user = {
          ...user,
          salary: employeeData.salary ?? user.salary,
          emergency_contact_name: employeeData.emergency_contact_name ?? user.emergency_contact_name,
          emergency_contact_phone: employeeData.emergency_contact_phone ?? user.emergency_contact_phone,
          bank_account_number: employeeData.bank_account_number ?? user.bank_account_number,
          bank_name: employeeData.bank_name ?? user.bank_name,
          bank_ifsc: employeeData.bank_ifsc ?? user.bank_ifsc,
        };
        console.log('✅ Merged user and employee data');
      }
    }

    return user;
  } catch (error) {
    console.error('❌ Error fetching user with employee data:', error);
    return null;
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
    console.log('🔄 Updating ERP user via backend API...', id);
    const response = await apiRequest<ErpUser | { success: boolean; data: ErpUser }>(
      `/erp-users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes)
      }
    );

    // Handle different response formats
    let user: ErpUser | null = null;
    if (response && typeof response === 'object' && 'id' in response) {
      user = response as ErpUser;
    } else if (response && typeof response === 'object' && 'data' in response) {
      user = response.data as ErpUser;
    }

    if (user) {
      console.log('✅ ERP user updated successfully:', user.id);
      return user;
    }

    return null;
  } catch (error) {
    console.error('❌ Backend API error updating ERP user:', error);
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
    console.log('🔄 Deleting ERP user via backend API...', id);
    await apiRequest(`/erp-users/${id}`, {
      method: 'DELETE'
    });
    console.log('✅ ERP user deleted successfully:', id);
  } catch (error) {
    console.error('❌ Backend API error deleting ERP user:', error);
    handleApiError('crm.deleteErpUser', error);
    useStatic = true;
    await deleteErpUser(id);
  }
}

// ============================================
// MANAGERS API
// ============================================

export interface Manager {
  erp_user_id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department?: string;
  designation?: string;
  role?: string;
  employee_id?: number;
}

export async function fetchManagers(searchTerm: string = ''): Promise<Manager[]> {
  try {
    console.log('🔄 Fetching managers from backend API...', searchTerm);
    const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const response = await apiRequest<{ success: boolean; data: Manager[] } | Manager[]>(
      `/erp-users/managers${queryParam}`
    );

    // Handle different response formats
    let managers: Manager[] = [];
    if (Array.isArray(response)) {
      managers = response;
    } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
      managers = Array.isArray(response.data) ? response.data : [];
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      managers = response.data;
    }

    console.log('✅ Managers loaded successfully:', managers.length);
    return managers;
  } catch (error) {
    console.error('❌ Backend API error fetching managers:', error);
    return [];
  }
}

// ============================================
// LEAVE MANAGEMENT API
// ============================================

export async function listLeaves(): Promise<Leave[]> {
  if (useStatic) return mockLeaves;

  try {
    console.log('🔄 Fetching leaves from backend API...');
    const response = await apiRequest<Leave[] | { success: boolean; data: Leave[] }>(
      '/leaves'
    );

    // Handle different response formats
    let leaves: Leave[] = [];
    if (Array.isArray(response)) {
      leaves = response;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      leaves = response.data;
    } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
      leaves = Array.isArray(response.data) ? response.data : [];
    }

    if (leaves.length > 0) {
      console.log('✅ Leaves loaded successfully:', leaves.length);
      return leaves;
    }

    console.log('⚠️ No leaves in response, using mock data');
    return mockLeaves;
  } catch (error) {
    console.error('❌ Backend API error fetching leaves:', error);
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
    console.log('🔄 Creating leave via backend API...');
    const response = await apiRequest<Leave | { success: boolean; data: Leave }>(
      '/leaves',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    // Handle different response formats
    let leave: Leave;
    if (response && typeof response === 'object' && 'id' in response) {
      leave = response as Leave;
    } else if (response && typeof response === 'object' && 'data' in response) {
      leave = response.data as Leave;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('✅ Leave created successfully:', leave.id);
    return leave;
  } catch (error) {
    console.error('❌ Backend API error creating leave:', error);
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
    console.log('🔄 Updating leave via backend API...', id);
    const response = await apiRequest<Leave | { success: boolean; data: Leave }>(
      `/leaves/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes)
      }
    );

    // Handle different response formats
    let leave: Leave | null = null;
    if (response && typeof response === 'object' && 'id' in response) {
      leave = response as Leave;
    } else if (response && typeof response === 'object' && 'data' in response) {
      leave = response.data as Leave;
    }

    if (leave) {
      console.log('✅ Leave updated successfully:', leave.id);
      return leave;
    }

    return null;
  } catch (error) {
    console.error('❌ Backend API error updating leave:', error);
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
    console.log('🔄 Deleting leave via backend API...', id);
    await apiRequest(`/leaves/${id}`, {
      method: 'DELETE'
    });
    console.log('✅ Leave deleted successfully:', id);
  } catch (error) {
    console.error('❌ Backend API error deleting leave:', error);
    handleApiError('crm.deleteLeave', error);
    useStatic = true;
    await deleteLeave(id);
  }
}

// ============================================
// TASK MANAGEMENT API
// ============================================

export async function listTasks(): Promise<Task[]> {
  if (useStatic) return mockTasks;

  try {
    console.log('🔄 Fetching tasks from backend API...');
    const response = await apiRequest<Task[] | { success: boolean; data: Task[] }>(
      '/tasks'
    );

    // Handle different response formats
    let tasks: Task[] = [];
    if (Array.isArray(response)) {
      tasks = response;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      tasks = response.data;
    } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
      tasks = Array.isArray(response.data) ? response.data : [];
    }

    if (tasks.length > 0) {
      console.log('✅ Tasks loaded successfully:', tasks.length);
      return tasks;
    }

    console.log('⚠️ No tasks in response, using mock data');
    return mockTasks;
  } catch (error) {
    console.error('❌ Backend API error fetching tasks:', error);
    handleApiError('crm.listTasks', error);
    useStatic = true;
    return mockTasks;
  }
}

export async function createTask(
  payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
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
    console.log('🔄 Creating task via backend API...');
    const response = await apiRequest<Task | { success: boolean; data: Task }>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    // Handle different response formats
    let task: Task;
    if (response && typeof response === 'object' && 'id' in response) {
      task = response as Task;
    } else if (response && typeof response === 'object' && 'data' in response) {
      task = response.data as Task;
    } else {
      throw new Error('Invalid response format');
    }

    console.log('✅ Task created successfully:', task.id);
    return task;
  } catch (error) {
    console.error('❌ Backend API error creating task:', error);
    handleApiError('crm.createTask', error);
    useStatic = true;
    return createTask(payload);
  }
}

export async function updateTask(
  id: string,
  changes: Partial<Task>
): Promise<Task | null> {
  if (useStatic) {
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    mockTasks[index] = { ...mockTasks[index], ...changes };
    return mockTasks[index];
  }

  try {
    console.log('🔄 Updating task via backend API...', id);
    const response = await apiRequest<Task | { success: boolean; data: Task }>(
      `/tasks/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes)
      }
    );

    // Handle different response formats
    let task: Task | null = null;
    if (response && typeof response === 'object' && 'id' in response) {
      task = response as Task;
    } else if (response && typeof response === 'object' && 'data' in response) {
      task = response.data as Task;
    }

    if (task) {
      console.log('✅ Task updated successfully:', task.id);
      return task;
    }

    return null;
  } catch (error) {
    console.error('❌ Backend API error updating task:', error);
    handleApiError('crm.updateTask', error);
    useStatic = true;
    return updateTask(id, changes);
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (useStatic) {
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index !== -1) mockTasks.splice(index, 1);
    return;
  }

  try {
    console.log('🔄 Deleting task via backend API...', id);
    await apiRequest(`/tasks/${id}`, {
      method: 'DELETE'
    });
    console.log('✅ Task deleted successfully:', id);
  } catch (error) {
    console.error('❌ Backend API error deleting task:', error);
    handleApiError('crm.deleteTask', error);
    useStatic = true;
    await deleteTask(id);
  }
}

