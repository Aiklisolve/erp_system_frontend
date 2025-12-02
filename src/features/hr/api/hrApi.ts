import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Employee } from '../types';

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



