import { ERPModule } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

type ModuleKpiPanelProps = {
  module: ERPModule;
};

export function ModuleKpiPanel({ module }: ModuleKpiPanelProps) {
  return (
    <Card className="space-y-4 bg-slate-900/90 border-emerald-500/20">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">Sample KPIs</h2>
        <Badge variant="outline" tone="brand">
          Static demo metrics
        </Badge>
      </div>
      <div className="space-y-3">
        {module.sampleKPIs.map((kpi) => (
          <div
            key={kpi.label}
            className="space-y-1 rounded-xl bg-slate-950/60 p-3 border border-slate-800"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-200">{kpi.label}</p>
              <span className="text-xs font-semibold text-emerald-300">
                {kpi.value}
              </span>
            </div>
            {kpi.trend && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      kpi.trend === 'up'
                        ? 'bg-emerald-400'
                        : kpi.trend === 'down'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                    style={{ width: kpi.trend === 'flat' ? '60%' : '80%' }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {kpi.trend === 'up'
                    ? 'Improving'
                    : kpi.trend === 'down'
                    ? 'Reduced'
                    : 'Stable'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}


