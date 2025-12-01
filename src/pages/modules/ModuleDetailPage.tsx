import { Link, useParams } from 'react-router-dom';
import { useErpModules } from '../../features/erp/hooks/useErpModules';
import { ModuleHeader } from '../../features/erp/components/ModuleHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function ModuleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getModuleBySlug } = useErpModules();
  const module = slug ? getModuleBySlug(slug) : undefined;

  if (!module) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Module not found</h1>
        <p className="text-xs text-slate-300">
          The module you are looking for doesn&apos;t exist in this demo.
        </p>
        <Button asChild variant="primary">
          <Link to="/modules">Back to modules</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader module={module} />
      <Card className="space-y-3 bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-100">
          Getting started
        </h2>
        <p className="text-xs text-slate-300">
          Use the primary route below to jump into the working list + form CRUD
          experience for this module. Behind the scenes, APIs call Supabase when
          configured and fall back to in-memory mock data when the database is not
          available.
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link to={module.primaryRoute}>Open {module.primaryEntityName}</Link>
        </Button>
      </Card>
    </div>
  );
}


