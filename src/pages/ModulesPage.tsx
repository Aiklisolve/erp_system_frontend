import { SectionHeader } from '../components/ui/SectionHeader';
import { ModulesGrid } from '../features/erp/components/ModulesGrid';

export function ModulesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="ERP Catalog"
        title="Explore all 13 ERP modules"
        description="Browse each module, understand core capabilities, and see example KPIs your teams can track."
      />
      <ModulesGrid />
    </div>
  );
}


