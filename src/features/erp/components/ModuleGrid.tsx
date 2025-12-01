import { useErpModules } from '../hooks/useErpModules';
import { ModuleCard } from './ModuleCard';

export function ModuleGrid() {
  const { getAllModules } = useErpModules();
  const modules = getAllModules();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}


