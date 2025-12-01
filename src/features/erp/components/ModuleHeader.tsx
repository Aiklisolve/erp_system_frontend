import { ErpModuleMeta } from '../data/erpModulesMeta';

type ModuleHeaderProps = {
  module: ErpModuleMeta;
};

export function ModuleHeader({ module }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
          <span className="uppercase tracking-[0.18em] text-[10px]">
            {module.slug}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>{module.primaryEntityName}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
          {module.name}
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl">{module.description}</p>
      </div>
    </div>
  );
}


