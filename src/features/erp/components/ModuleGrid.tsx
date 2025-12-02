import { useErpModules } from '../hooks/useErpModules';
import { ModuleCard } from './ModuleCard';
import { useRolePermissions } from '../../auth/hooks/useRolePermissions';

export function ModuleGrid() {
  const { getAllModules } = useErpModules();
  const { canAccess } = useRolePermissions();
  const allModules = getAllModules();

  // Filter modules based on user role permissions
  const accessibleModules = allModules.filter((module) =>
    canAccess(module.primaryRoute as any)
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accessibleModules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}


