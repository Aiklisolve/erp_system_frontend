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
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
      {accessibleModules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}


