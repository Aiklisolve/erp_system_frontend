import { ModuleGrid } from '../../features/erp/components/ModuleGrid';

export function ModulesListPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
        ERP modules
      </h1>
      <p className="text-xs text-slate-300 max-w-2xl">
        Explore the 13 ERP modules in this demo. Each module has its own list and form
        components, backed by Supabase-ready APIs with local mock fallbacks.
      </p>
      <ModuleGrid />
    </div>
  );
}


