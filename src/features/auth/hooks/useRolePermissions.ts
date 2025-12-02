import { useAuth } from './useAuth';
import { hasModuleAccess, getAllowedModules, type ModuleRoute } from '../data/rolePermissions';

export function useRolePermissions() {
  const { getUserRole } = useAuth();
  const role = getUserRole();

  const canAccess = (route: ModuleRoute): boolean => {
    return hasModuleAccess(role, route);
  };

  const getAllowedRoutes = (): ModuleRoute[] => {
    return getAllowedModules(role);
  };

  return {
    role,
    canAccess,
    getAllowedRoutes
  };
}

