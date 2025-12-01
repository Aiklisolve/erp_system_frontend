import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatCard } from '../components/ui/StatCard';
import { ModuleSummaryCards } from '../features/erp/components/ModuleSummaryCards';
import { appConfig } from '../config/appConfig';

export function HomePage() {
  const handleScrollToStats = () => {
    const el = document.getElementById('demo-stats');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-16">
      <section className="grid gap-10 md:grid-cols-[1.4fr,1fr] items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 mb-2">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {appConfig.tagline}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
            13 ERP Modules,
            <span className="text-emerald-400"> One Unified Platform.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-xl">
            Explore how modern ERP streamlines finance, operations, HR, and more for
            growing businesses, universities, and non-profits. All modules in this demo
            run on static data, ready to be wired to Supabase.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to="/modules">Explore Modules</Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={handleScrollToStats}>
              View Demo Dashboard
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            No signup required. Perfect for demos, stakeholder walkthroughs, and product
            pitches.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/20 blur-3xl opacity-50" />
          <div className="relative rounded-3xl border border-emerald-400/30 bg-slate-900/80 p-5 shadow-soft space-y-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
              Live demo snapshot
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200 border border-emerald-500/40">
                Static data
              </span>
            </h2>
            <ModuleSummaryCards />
          </div>
        </div>
      </section>

      <section id="demo-stats" className="space-y-6">
        <SectionHeader
          eyebrow="Demo Analytics"
          title="See the impact of connected ERP data"
          description="These sample KPIs illustrate the type of insights your teams can monitor in real time once wired to Supabase and production data sources."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="+25% faster month-end close"
            value="25%"
            helper="Automated postings & reconciliations in Finance."
            trend="up"
          />
          <StatCard
            label="99.9% inventory accuracy"
            value="99.9%"
            helper="Real-time stock, reduced write-offs and surprises."
            trend="up"
          />
          <StatCard
            label="-18% order cycle time"
            value="18%"
            helper="From order to shipment across Sales, Inventory and WMS."
            trend="down"
          />
          <StatCard
            label="99.9% uptime"
            value="99.9%"
            helper="Supabase-backed SaaS architecture designed for scale."
            trend="flat"
          />
        </div>
      </section>
    </div>
  );
}


