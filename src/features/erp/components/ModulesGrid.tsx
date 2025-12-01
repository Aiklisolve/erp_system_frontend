import { useErpModules } from '../hooks/useErpModules';
import { ModuleCard } from './ModuleCard';

export function ModulesGrid() {
  const { getAllModules } = useErpModules();
  const modules = getAllModules();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <ModuleCard key={m.id} module={m} />
      ))}
    </div>
  );
}


