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
  | '/internal-tasks';

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
    '/internal-tasks'
  ],
  FINANCE_MANAGER: [
    '/dashboard',
    '/finance',
    '/procurement',
    '/orders',
    '/crm',
    '/projects'
  ],
  INVENTORY_MANAGER: [
    '/dashboard',
    '/inventory',
    '/warehouse',
    '/manufacturing',
    '/supply-chain',
    '/orders'
  ],
  PROCUREMENT_OFFICER: [
    '/dashboard',
    '/procurement',
    '/supply-chain',
    '/warehouse',
    '/inventory'
  ],
  HR_MANAGER: [
    '/dashboard',
    '/hr',
    '/workforce',
    '/projects',
    '/internal-tasks'
  ],
  SALES_MANAGER: [
    '/dashboard',
    '/crm',
    '/orders',
    '/ecommerce',
    '/marketing',
    '/projects',
    '/internal-tasks'
  ],
  WAREHOUSE_OPERATOR: [
    '/dashboard',
    '/warehouse',
    '/inventory',
    '/orders'
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
    '/marketing'
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

