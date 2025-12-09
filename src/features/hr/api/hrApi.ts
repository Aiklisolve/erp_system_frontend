import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { Employee, LeaveRequest } from '../types';

const USE_BACKEND_API = true; // Use backend API by default
let useStatic = !hasSupabaseConfig;

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    employee_number: 'EMP-2022-PRI001',
    first_name: 'Priya',
    last_name: 'Sharma',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@erp.local',
    phone: '+1 555-0101',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    role: 'Finance Manager',
    erp_role: 'FINANCE_MANAGER',
    department: 'FINANCE',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    join_date: '2022-04-01',
    probation_end_date: '2022-07-01',
    manager_name: 'CEO',
    reporting_manager: 'CEO',
    salary: 75000,
    currency: 'USD',
    pay_frequency: 'MONTHLY',
    skills: ['Financial Analysis', 'Budgeting', 'ERP Systems'],
    certifications: ['CPA', 'CFA'],
    education_level: 'MASTER',
    education_field: 'Finance',
    years_of_experience: 8,
    performance_rating: 4.7,
    last_review_date: '2024-12-01',
    next_review_date: '2025-06-01',
    annual_leave_balance: 15,
    sick_leave_balance: 10,
    notes: 'Excellent performance, leading finance team',
    created_at: '2022-04-01'
  },
  {
    id: 'emp-2',
    employee_number: 'EMP-2021-TOM002',
    first_name: 'Tom',
    last_name: 'Müller',
    full_name: 'Tom Müller',
    email: 'tom.muller@erp.local',
    phone: '+1 555-0202',
    address: '456 Warehouse Road',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90001',
    country: 'USA',
    role: 'Warehouse Lead',
    erp_role: 'WAREHOUSE_OPERATOR',
    department: 'WAREHOUSE',
    employment_type: 'FULL_TIME',
    status: 'ON_LEAVE',
    join_date: '2021-09-15',
    manager_name: 'Operations Manager',
    reporting_manager: 'Operations Manager',
    salary: 55000,
    currency: 'USD',
    pay_frequency: 'MONTHLY',
    skills: ['Warehouse Management', 'Inventory Control', 'Team Leadership'],
    education_level: 'BACHELOR',
    education_field: 'Operations Management',
    years_of_experience: 5,
    performance_rating: 4.3,
    last_review_date: '2024-11-01',
    next_review_date: '2025-05-01',
    annual_leave_balance: 8,
    sick_leave_balance: 5,
    notes: 'On medical leave until further notice',
    created_at: '2021-09-15'
  },
  {
    id: 'emp-3',
    employee_number: 'EMP-2023-SAR003',
    first_name: 'Sarah',
    last_name: 'Johnson',
    full_name: 'Sarah Johnson',
    email: 'sarah.johnson@erp.local',
    phone: '+1 555-0303',
    role: 'Sales Manager',
    erp_role: 'SALES_MANAGER',
    department: 'SALES',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    join_date: '2023-01-10',
    manager_name: 'VP Sales',
    reporting_manager: 'VP Sales',
    salary: 65000,
    currency: 'USD',
    pay_frequency: 'MONTHLY',
    commission_rate: 5,
    skills: ['Sales', 'CRM', 'Customer Relations'],
    education_level: 'BACHELOR',
    education_field: 'Business',
    years_of_experience: 6,
    performance_rating: 4.8,
    last_review_date: '2024-12-15',
    next_review_date: '2025-06-15',
    annual_leave_balance: 20,
    sick_leave_balance: 8,
    notes: 'Top performer, exceeded sales targets',
    created_at: '2023-01-10'
  },
  {
    id: 'emp-4',
    employee_number: 'EMP-2024-MIK004',
    first_name: 'Mike',
    last_name: 'Wilson',
    full_name: 'Mike Wilson',
    email: 'mike.wilson@erp.local',
    phone: '+1 555-0404',
    role: 'HR Manager',
    erp_role: 'HR_MANAGER',
    department: 'HR',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    join_date: '2024-03-01',
    manager_name: 'VP HR',
    reporting_manager: 'VP HR',
    salary: 70000,
    currency: 'USD',
    pay_frequency: 'MONTHLY',
    skills: ['HR Management', 'Recruitment', 'Employee Relations'],
    certifications: ['SHRM-CP'],
    education_level: 'MASTER',
    education_field: 'Human Resources',
    years_of_experience: 7,
    performance_rating: 4.5,
    annual_leave_balance: 18,
    sick_leave_balance: 10,
    notes: 'New hire, onboarding well',
    created_at: '2024-03-01'
  }
];

function nextId() {
  return `emp-${Math.random().toString(36).slice(2, 8)}`;
}

function nextLeaveId() {
  return `leave-${Math.random().toString(36).slice(2, 8)}`;
}

// Map backend employee response to frontend Employee type
function mapBackendEmployee(backendEmployee: any): Employee {
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
    id: backendEmployee.id?.toString() || backendEmployee.employee_id?.toString() || nextId(),
    employee_number: backendEmployee.employee_number || backendEmployee.employee_id?.toString() || null,
    employee_id: backendEmployee.employee_id?.toString() || backendEmployee.id?.toString() || null,
    
    // Personal Information
    first_name: backendEmployee.first_name || '',
    last_name: backendEmployee.last_name || '',
    full_name: backendEmployee.full_name || 
      (backendEmployee.first_name && backendEmployee.last_name 
        ? `${backendEmployee.first_name} ${backendEmployee.last_name}`.trim()
        : backendEmployee.name || ''),
    date_of_birth: formatDate(backendEmployee.date_of_birth),
    gender: backendEmployee.gender || undefined,
    marital_status: backendEmployee.marital_status || undefined,
    national_id: backendEmployee.national_id || backendEmployee.aadhar_number || backendEmployee.ssn || undefined,
    passport_number: backendEmployee.passport_number || undefined,
    
    // Contact Information
    email: backendEmployee.email || '',
    phone: backendEmployee.phone || backendEmployee.mobile || undefined,
    alternate_phone: backendEmployee.alternate_phone || undefined,
    emergency_contact_name: backendEmployee.emergency_contact_name || undefined,
    emergency_contact_phone: backendEmployee.emergency_contact_phone || undefined,
    emergency_contact_relationship: backendEmployee.emergency_contact_relationship || undefined,
    
    // Address
    address: backendEmployee.address || undefined,
    city: backendEmployee.city || undefined,
    state: backendEmployee.state || undefined,
    postal_code: backendEmployee.postal_code || backendEmployee.pincode || backendEmployee.zip_code || undefined,
    country: backendEmployee.country || undefined,
    
    // Employment Details
    role: backendEmployee.role || backendEmployee.position || backendEmployee.job_title || backendEmployee.designation || '',
    erp_role: backendEmployee.erp_role || backendEmployee.erp_user?.role || undefined,
    department: backendEmployee.department || undefined,
    employment_type: backendEmployee.employment_type || backendEmployee.employment_status || 'FULL_TIME',
    status: (backendEmployee.status || backendEmployee.employment_status || 'ACTIVE').toString().toUpperCase() as any,
    
    // Dates
    join_date: formatDate(backendEmployee.join_date || backendEmployee.hire_date || backendEmployee.joining_date),
    probation_end_date: formatDate(backendEmployee.probation_end_date),
    contract_start_date: formatDate(backendEmployee.contract_start_date),
    contract_end_date: formatDate(backendEmployee.contract_end_date),
    last_promotion_date: formatDate(backendEmployee.last_promotion_date),
    termination_date: formatDate(backendEmployee.termination_date),
    
    // Manager & Reporting - Handle nested manager object
    manager_id: backendEmployee.manager_id?.toString() || backendEmployee.manager?.id?.toString() || undefined,
    manager_name: backendEmployee.manager_name || 
      (backendEmployee.manager && backendEmployee.manager.full_name ? backendEmployee.manager.full_name : undefined) ||
      (backendEmployee.manager && backendEmployee.manager.first_name && backendEmployee.manager.last_name 
        ? `${backendEmployee.manager.first_name} ${backendEmployee.manager.last_name}`.trim()
        : undefined) ||
      backendEmployee.reporting_manager || 
      undefined,
    reporting_manager: backendEmployee.reporting_manager || 
      (backendEmployee.manager && backendEmployee.manager.full_name ? backendEmployee.manager.full_name : undefined) ||
      (backendEmployee.manager && backendEmployee.manager.first_name && backendEmployee.manager.last_name 
        ? `${backendEmployee.manager.first_name} ${backendEmployee.manager.last_name}`.trim()
        : undefined) ||
      backendEmployee.manager_name || 
      undefined,
    team: backendEmployee.team || undefined,
    
    // Compensation
    salary: backendEmployee.salary ? parseFloat(backendEmployee.salary) : undefined,
    hourly_rate: backendEmployee.hourly_rate ? parseFloat(backendEmployee.hourly_rate) : undefined,
    currency: backendEmployee.currency || 'USD',
    pay_frequency: backendEmployee.pay_frequency || 'MONTHLY',
    bonus: backendEmployee.bonus ? parseFloat(backendEmployee.bonus) : undefined,
    commission_rate: backendEmployee.commission_rate ? parseFloat(backendEmployee.commission_rate) : undefined,
    
    // Benefits
    benefits: formatArray(backendEmployee.benefits),
    insurance_policy_number: backendEmployee.insurance_policy_number || undefined,
    insurance_expiry: formatDate(backendEmployee.insurance_expiry),
    
    // Skills & Qualifications
    skills: formatArray(backendEmployee.skills),
    certifications: formatArray(backendEmployee.certifications),
    education_level: backendEmployee.education_level || undefined,
    education_field: backendEmployee.education_field || undefined,
    years_of_experience: backendEmployee.years_of_experience ? parseFloat(backendEmployee.years_of_experience) : undefined,
    
    // Performance
    performance_rating: backendEmployee.performance_rating ? parseFloat(backendEmployee.performance_rating) : undefined,
    last_review_date: formatDate(backendEmployee.last_review_date),
    next_review_date: formatDate(backendEmployee.next_review_date),
    
    // Leave Balance
    annual_leave_balance: backendEmployee.annual_leave_balance ? parseFloat(backendEmployee.annual_leave_balance) : undefined,
    sick_leave_balance: backendEmployee.sick_leave_balance ? parseFloat(backendEmployee.sick_leave_balance) : undefined,
    other_leave_balance: backendEmployee.other_leave_balance ? parseFloat(backendEmployee.other_leave_balance) : undefined,
    
    // Additional
    notes: backendEmployee.notes || undefined,
    internal_notes: backendEmployee.internal_notes || undefined,
    tags: formatArray(backendEmployee.tags),
    
    created_at: backendEmployee.created_at || new Date().toISOString(),
    updated_at: backendEmployee.updated_at || new Date().toISOString(),
  };
}

export async function listEmployees(): Promise<Employee[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching employees from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { employees: any[]; pagination?: any } } | { employees: any[] } | any[]>(
        '/hr/employees?page=1&limit=1000'
      );

      console.log('👥 Backend employees response:', response);

      // Handle different response formats
      let employees = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.employees) {
          employees = response.data.employees;
        } else if ('employees' in response) {
          employees = response.employees;
        } else if (Array.isArray(response)) {
          employees = response;
        }
      }

      if (employees.length > 0) {
        const mapped = employees.map(mapBackendEmployee);
        console.log('✅ Mapped employees:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No employees in response, falling back to mock data');
      return mockEmployees;
    } catch (error) {
      console.error('❌ Backend API error fetching employees:', error);
      return mockEmployees;
    }
  }

  // Fallback to Supabase or mock
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating employee via backend API...', payload);
      
      const response = await apiRequest<{ success: boolean; data: { employee: any } } | { employee: any } | any>(
        '/hr/employees',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      console.log('✅ Backend create employee response:', response);

      let employee = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.employee) {
          employee = response.data.employee;
        } else if ('employee' in response) {
          employee = response.employee;
        } else if (!('success' in response)) {
          employee = response;
        }
      }

      if (employee) {
        const mapped = mapBackendEmployee(employee);
        console.log('✅ Created employee:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error creating employee:', error);
      // Fallback to mock
      const emp: Employee = {
        ...payload,
        id: nextId(),
        created_at: new Date().toISOString()
      };
      mockEmployees.unshift(emp);
      return emp;
    }
  }

  // Fallback to Supabase or mock
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating employee via backend API...', id, changes);
      
      const response = await apiRequest<{ success: boolean; data: { employee: any } } | { employee: any } | any>(
        `/hr/employees/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(changes),
        }
      );

      console.log('✅ Backend update employee response:', response);

      let employee = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.employee) {
          employee = response.data.employee;
        } else if ('employee' in response) {
          employee = response.employee;
        } else if (!('success' in response)) {
          employee = response;
        }
      }

      if (employee) {
        const mapped = mapBackendEmployee(employee);
        console.log('✅ Updated employee:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error updating employee:', error);
      // Fallback to mock
      const index = mockEmployees.findIndex((e) => e.id === id);
      if (index === -1) return null;
      mockEmployees[index] = { ...mockEmployees[index], ...changes };
      return mockEmployees[index];
    }
  }

  // Fallback to Supabase or mock
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting employee via backend API...', id);
      
      await apiRequest(
        `/hr/employees/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('✅ Deleted employee:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting employee:', error);
      // Fallback to mock
      const index = mockEmployees.findIndex((e) => e.id === id);
      if (index !== -1) mockEmployees.splice(index, 1);
      return;
    }
  }

  // Fallback to Supabase or mock
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

// ============================================
// LEAVE MANAGEMENT API
// ============================================

const mockLeaves: LeaveRequest[] = [
  {
    id: 'leave-001',
    leave_number: 'LV-2025-001',
    employee_id: 'emp-1',
    employee_name: 'Priya Sharma',
    leave_type: 'ANNUAL',
    start_date: '2025-02-10',
    end_date: '2025-02-14',
    total_days: 5,
    status: 'APPROVED',
    reason: 'Family vacation',
    applied_date: '2025-01-15',
    approved_by: 'Mike Wilson',
    approved_date: '2025-01-16',
    notes: 'All pending work completed before leave',
    created_at: '2025-01-15'
  },
  {
    id: 'leave-002',
    leave_number: 'LV-2025-002',
    employee_id: 'emp-2',
    employee_name: 'Tom Müller',
    leave_type: 'SICK',
    start_date: '2025-01-20',
    end_date: '2025-01-25',
    total_days: 6,
    status: 'APPROVED',
    reason: 'Medical treatment',
    medical_certificate_required: true,
    medical_certificate_provided: true,
    applied_date: '2025-01-19',
    approved_by: 'Mike Wilson',
    approved_date: '2025-01-19',
    notes: 'Medical certificate attached',
    created_at: '2025-01-19'
  },
  {
    id: 'leave-003',
    leave_number: 'LV-2025-003',
    employee_id: 'emp-3',
    employee_name: 'Sarah Johnson',
    leave_type: 'ANNUAL',
    start_date: '2025-03-01',
    end_date: '2025-03-05',
    total_days: 5,
    status: 'PENDING',
    reason: 'Personal work',
    applied_date: '2025-01-25',
    notes: 'Awaiting manager approval',
    created_at: '2025-01-25'
  }
];

// Map backend leave response to frontend LeaveRequest type
function mapBackendLeave(backendLeave: any): LeaveRequest {
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return '';
  };

  return {
    id: backendLeave.id?.toString() || backendLeave.leave_id?.toString() || nextLeaveId(),
    leave_number: backendLeave.leave_number || backendLeave.leave_id?.toString() || null,
    employee_id: backendLeave.employee_id?.toString() || '',
    employee_name: backendLeave.employee_name || backendLeave.employee?.name || backendLeave.employee?.full_name || '',
    leave_type: backendLeave.leave_type || 'ANNUAL',
    start_date: formatDate(backendLeave.start_date),
    end_date: formatDate(backendLeave.end_date),
    total_days: backendLeave.total_days ? parseFloat(backendLeave.total_days) : undefined,
    status: backendLeave.status || 'PENDING',
    reason: backendLeave.reason || undefined,
    medical_certificate_required: backendLeave.medical_certificate_required || false,
    medical_certificate_provided: backendLeave.medical_certificate_provided || false,
    applied_date: formatDate(backendLeave.applied_date || backendLeave.created_at),
    approved_by: backendLeave.approved_by || undefined,
    approved_date: formatDate(backendLeave.approved_date),
    rejected_reason: backendLeave.rejected_reason || undefined,
    notes: backendLeave.notes || undefined,
    created_at: backendLeave.created_at || new Date().toISOString(),
    updated_at: backendLeave.updated_at || new Date().toISOString(),
  };
}

export async function listLeaves(): Promise<LeaveRequest[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching leave requests from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { leaves: any[]; pagination?: any } } | { leaves: any[] } | any[]>(
        '/hr/leaves?page=1&limit=1000'
      );

      console.log('📋 Backend leaves response:', response);

      // Handle different response formats
      let leaves = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.leaves) {
          leaves = response.data.leaves;
        } else if ('leaves' in response) {
          leaves = response.leaves;
        } else if (Array.isArray(response)) {
          leaves = response;
        }
      }

      if (leaves.length > 0) {
        const mapped = leaves.map(mapBackendLeave);
        console.log('✅ Mapped leave requests:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No leaves in response, falling back to mock data');
      return mockLeaves;
    } catch (error) {
      console.error('❌ Backend API error fetching leaves:', error);
      return mockLeaves;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) return mockLeaves;

  try {
    const { data, error } = await supabase.from('leave_requests').select('*');
    if (error) throw error;
    return (data as LeaveRequest[]) ?? [];
  } catch (error) {
    handleApiError('hr.listLeaves', error);
    useStatic = true;
    return mockLeaves;
  }
}

export async function createLeave(
  payload: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>
): Promise<LeaveRequest> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating leave request via backend API...', payload);
      
      const response = await apiRequest<{ success: boolean; data: { leave: any } } | { leave: any } | any>(
        '/hr/leaves',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      console.log('✅ Backend create leave response:', response);

      let leave = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.leave) {
          leave = response.data.leave;
        } else if ('leave' in response) {
          leave = response.leave;
        } else if (!('success' in response)) {
          leave = response;
        }
      }

      if (leave) {
        const mapped = mapBackendLeave(leave);
        console.log('✅ Created leave request:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error creating leave:', error);
      // Fallback to mock
      const leave: LeaveRequest = {
        ...payload,
        id: nextLeaveId(),
        created_at: new Date().toISOString()
      };
      mockLeaves.unshift(leave);
      return leave;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const leave: LeaveRequest = {
      ...payload,
      id: nextLeaveId(),
      created_at: new Date().toISOString()
    };
    mockLeaves.unshift(leave);
    return leave;
  }

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as LeaveRequest;
  } catch (error) {
    handleApiError('hr.createLeave', error);
    useStatic = true;
    return createLeave(payload);
  }
}

export async function updateLeave(
  id: string,
  changes: Partial<LeaveRequest>
): Promise<LeaveRequest | null> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating leave request via backend API...', id, changes);
      
      const response = await apiRequest<{ success: boolean; data: { leave: any } } | { leave: any } | any>(
        `/hr/leaves/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(changes),
        }
      );

      console.log('✅ Backend update leave response:', response);

      let leave = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.leave) {
          leave = response.data.leave;
        } else if ('leave' in response) {
          leave = response.leave;
        } else if (!('success' in response)) {
          leave = response;
        }
      }

      if (leave) {
        const mapped = mapBackendLeave(leave);
        console.log('✅ Updated leave request:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error updating leave:', error);
      // Fallback to mock
      const index = mockLeaves.findIndex((l) => l.id === id);
      if (index === -1) return null;
      mockLeaves[index] = { ...mockLeaves[index], ...changes };
      return mockLeaves[index];
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockLeaves.findIndex((l) => l.id === id);
    if (index === -1) return null;
    mockLeaves[index] = { ...mockLeaves[index], ...changes };
    return mockLeaves[index];
  }

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as LeaveRequest;
  } catch (error) {
    handleApiError('hr.updateLeave', error);
    useStatic = true;
    return updateLeave(id, changes);
  }
}

export async function deleteLeave(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting leave request via backend API...', id);
      
      await apiRequest(
        `/hr/leaves/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('✅ Deleted leave request:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting leave:', error);
      // Fallback to mock
      const index = mockLeaves.findIndex((l) => l.id === id);
      if (index !== -1) mockLeaves.splice(index, 1);
      return;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) mockLeaves.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('hr.deleteLeave', error);
    useStatic = true;
    await deleteLeave(id);
  }
}

