import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ModuleKpiPanel } from '../features/erp/components/ModuleKpiPanel';
import { useErpModules } from '../features/erp/hooks/useErpModules';

export function ModuleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getModuleBySlug } = useErpModules();
  const module = slug ? getModuleBySlug(slug) : undefined;

  if (!module) {
    return (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <SectionHeader
          eyebrow="Module not found"
          title="We couldn&apos;t find that ERP module"
          description="The module you&apos;re looking for might have been renamed or doesn&apos;t exist in this demo yet."
        />
        <Button asChild variant="primary">
          <Link to="/modules">Back to all modules</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge variant="outline" tone="brand">
              {module.icon}
            </Badge>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              ERP Module
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            {module.name}
          </h1>
          <p className="text-slate-300 max-w-2xl">{module.description}</p>
        </div>
        <Button asChild variant="ghost">
          <Link to="/modules">&larr; Back to Modules</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr] items-start">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Key capabilities
          </h2>
          <ul className="space-y-2 text-sm text-slate-200">
            {module.keyFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        <ModuleKpiPanel module={module} />
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/70 border-dashed border-emerald-500/40">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Ready for real data
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            All KPIs and descriptions on this page are static. Replace them with live
            Supabase queries in `useErpModules` and dedicated analytics tables when you
            connect to your production environment.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link to={`/modules/${module.slug}/records`}>Open demo records</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">View overall demo dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}


