import { Link } from 'react-router-dom';
import type { ErpModuleMeta } from '../data/erpModulesMeta';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

type ModuleCardProps = {
  module: ErpModuleMeta;
};

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Card className="flex flex-col justify-between gap-3 bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-emerald-400/50 transition-colors">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-400/40 text-[11px] uppercase text-emerald-200">
            {module.icon}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-50">{module.name}</h3>
            <p className="text-[11px] text-slate-400 capitalize">
              {module.primaryEntityName}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 line-clamp-3">{module.description}</p>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-slate-500">
          Route: <span className="text-slate-300">{module.primaryRoute}</span>
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link to={module.primaryRoute}>Open</Link>
        </Button>
      </div>
    </Card>
  );
}

