export type ErpRole = 'ADMIN' | 'FINANCE_MANAGER' | 'INVENTORY_MANAGER' | 'PROCUREMENT_OFFICER' | 'HR_MANAGER' | 'SALES_MANAGER' | 'WAREHOUSE_OPERATOR' | 'VIEWER';

export interface StaticUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: ErpRole;
  department?: string;
}

export const staticUsers: StaticUser[] = [
  {
    id: 'admin-001',
    email: 'admin@erp.local',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'ADMIN',
    department: 'IT'
  },
  {
    id: 'finance-001',
    email: 'finance@erp.local',
    password: 'finance123',
    fullName: 'Finance Manager',
    role: 'FINANCE_MANAGER',
    department: 'Finance'
  },
  {
    id: 'inventory-001',
    email: 'inventory@erp.local',
    password: 'inventory123',
    fullName: 'Inventory Manager',
    role: 'INVENTORY_MANAGER',
    department: 'Operations'
  },
  {
    id: 'procurement-001',
    email: 'procurement@erp.local',
    password: 'procurement123',
    fullName: 'Procurement Officer',
    role: 'PROCUREMENT_OFFICER',
    department: 'Procurement'
  },
  {
    id: 'hr-001',
    email: 'hr@erp.local',
    password: 'hr123',
    fullName: 'HR Manager',
    role: 'HR_MANAGER',
    department: 'Human Resources'
  },
  {
    id: 'sales-001',
    email: 'sales@erp.local',
    password: 'sales123',
    fullName: 'Sales Manager',
    role: 'SALES_MANAGER',
    department: 'Sales'
  },
  {
    id: 'warehouse-001',
    email: 'warehouse@erp.local',
    password: 'warehouse123',
    fullName: 'Warehouse Operator',
    role: 'WAREHOUSE_OPERATOR',
    department: 'Warehouse'
  },
  {
    id: 'viewer-001',
    email: 'viewer@erp.local',
    password: 'viewer123',
    fullName: 'Viewer User',
    role: 'VIEWER',
    department: 'General'
  }
];

export const roleDescriptions: Record<ErpRole, string> = {
  ADMIN: 'Full system access and administration',
  FINANCE_MANAGER: 'Manage financial transactions, invoices, and reports',
  INVENTORY_MANAGER: 'Manage inventory, stock levels, and warehouses',
  PROCUREMENT_OFFICER: 'Handle purchase orders and supplier management',
  HR_MANAGER: 'Manage employees, workforce, and HR operations',
  SALES_MANAGER: 'Manage sales orders, CRM, and customer relationships',
  WAREHOUSE_OPERATOR: 'Operate warehouse activities and stock movements',
  VIEWER: 'Read-only access to view reports and dashboards'
};

