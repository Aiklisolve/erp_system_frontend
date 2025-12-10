import type { ErpRole } from './staticUsers';

export type ModuleRoute =
  | '/dashboard'
  | '/modules'
  | '/finance'
  | '/procurement'
  | '/manufacturing'
  | '/inventory'
  | '/orders'
  | '/warehouse'
  | '/supply-chain'
  | '/crm'
  | '/projects'
  | '/workforce'
  | '/hr'
  | '/ecommerce'
  | '/marketing'
  | '/internal-tasks'
  | '/reports'
  | '/invoices';

export const roleModulePermissions: Record<ErpRole, ModuleRoute[]> = {
  ADMIN: [
    '/dashboard',
    '/modules',
    '/finance',
    '/procurement',
    '/manufacturing',
    '/inventory',
    '/orders',
    '/warehouse',
    '/supply-chain',
    '/crm',
    '/projects',
    '/workforce',
    '/hr',
    '/ecommerce',
    '/marketing',
    '/internal-tasks',
    '/reports',
    '/invoices'
  ],
  FINANCE_MANAGER: [
    '/dashboard',
    '/finance',
    '/procurement',
    '/orders',
    '/crm',
    '/projects',
    '/reports',
    '/invoices'
  ],
  INVENTORY_MANAGER: [
    '/dashboard',
    '/inventory',
    '/warehouse',
    '/manufacturing',
    '/supply-chain',
    '/orders',
    '/reports',
    '/invoices'
  ],
  PROCUREMENT_OFFICER: [
    '/dashboard',
    '/procurement',
    '/supply-chain',
    '/warehouse',
    '/inventory',
    '/reports',
    '/invoices'
  ],
  HR_MANAGER: [
    '/dashboard',
    '/hr',
    '/workforce',
    '/projects',
    '/internal-tasks',
    '/reports',
    '/invoices'
  ],
  SALES_MANAGER: [
    '/dashboard',
    '/crm',
    '/orders',
    '/ecommerce',
    '/marketing',
    '/projects',
    '/internal-tasks',
    '/reports',
    '/invoices'
  ],
  WAREHOUSE_OPERATOR: [
    '/dashboard',
    '/warehouse',
    '/inventory',
    '/orders',
    '/reports',
    '/invoices'
  ],
  VIEWER: [
    '/dashboard',
    '/finance',
    '/procurement',
    '/inventory',
    '/orders',
    '/warehouse',
    '/crm',
    '/projects',
    '/workforce',
    '/hr',
    '/ecommerce',
    '/marketing',
    '/reports',
    '/invoices'
  ]
};

export function hasModuleAccess(role: ErpRole | null, route: ModuleRoute): boolean {
  if (!role) return false;
  const allowedRoutes = roleModulePermissions[role] || [];
  return allowedRoutes.includes(route);
}

export function getAllowedModules(role: ErpRole | null): ModuleRoute[] {
  if (!role) return ['/dashboard'];
  return roleModulePermissions[role] || ['/dashboard'];
}

