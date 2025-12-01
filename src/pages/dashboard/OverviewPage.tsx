import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { ModuleGrid } from '../../features/erp/components/ModuleGrid';

const MINI_BARS = [60, 90, 40, 75, 55];

export function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-dark">
            Unified control
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Unified ERP System Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl">
            See finance, operations, people, and growth in one place. This demo mirrors
            how a modern SaaS ERP surfaces the health of your business at a glance.
          </p>
        </div>
        <Card className="flex w-full max-w-xs flex-col gap-3 border-dashed border-emerald-200 bg-emerald-50/60">
          <p className="text-[11px] font-medium text-emerald-800">
            Today&apos;s snapshot
          </p>
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span>Data freshness</span>
            <span className="font-semibold text-emerald-700">Demo · Live UI</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div className="absolute inset-y-0 left-0 w-3/4 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500">
            Connect Supabase to replace mock data with production-grade metrics.
          </p>
        </Card>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (MTD)"
          value="$248,400"
          helper="Across all entities"
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Orders in pipeline"
          value="342"
          helper="Sales + Ecommerce"
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Inventory health"
          value="89%"
          helper="Within target bands"
          trend="flat"
          variant="yellow"
        />
        <StatCard
          label="Workforce availability"
          value="94%"
          helper="Planned vs. scheduled"
          trend="up"
          variant="purple"
        />
      </section>

      {/* Charts & activity */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Orders & utilization
            </h2>
            <p className="text-[11px] text-slate-500">Demo HTML/CSS charts</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Mini bar graph */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700">
                Weekly order volume
              </p>
              <div className="flex items-end gap-2 h-24">
                {MINI_BARS.map((height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-sky-200 to-sky-500 transition-transform duration-150 hover:scale-105"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>
            </div>

            {/* Progress ring */}
            <div className="space-y-3 flex flex-col items-center justify-center">
              <p className="w-full text-left text-xs font-medium text-slate-700">
                Fulfilment SLA hit rate
              </p>
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent rotate-45" />
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <span className="text-sm font-semibold text-emerald-700">
                    96%
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Orders shipped within agreed SLA windows across all channels.
              </p>
            </div>
          </div>
        </Card>

        {/* Activity timeline */}
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Activity timeline
          </h2>
          <div className="relative pl-4">
            <div className="absolute left-1 top-0 h-full w-px bg-slate-200" />
            <div className="space-y-3 text-xs">
              {[
                {
                  title: 'Invoice INV-2045 posted',
                  time: '2 min ago',
                  module: 'Finance'
                },
                {
                  title: 'PO-883 approved for Acme Components',
                  time: '34 min ago',
                  module: 'Procurement'
                },
                {
                  title: '15 SKUs reached reorder point',
                  time: '1 hr ago',
                  module: 'Inventory'
                },
                {
                  title: 'New campaign “Q1 Retention” launched',
                  time: '3 hr ago',
                  module: 'Marketing'
                }
              ].map((item) => (
                <div key={item.title} className="relative flex gap-3">
                  <div className="absolute -left-4 mt-1 h-2 w-2 rounded-full bg-brand" />
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.time} · {item.module}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Modules & recent tables */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1.1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Quick module shortcuts
            </h2>
            <p className="text-[11px] text-slate-500">
              Open workspaces from a single grid.
            </p>
          </div>
          <ModuleGrid />
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent transactions
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Filter</span>
              <input
                placeholder="Search finance..."
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Account</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-700">2025-01-06</td>
                  <td className="px-3 py-2 text-slate-700">4000 · Product revenue</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      INCOME
                    </span>
                  </td>
                  <td className="px-3 py-2 text-emerald-700 font-semibold">
                    $12,500
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-700">2025-01-05</td>
                  <td className="px-3 py-2 text-slate-700">6000 · Cloud hosting</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      EXPENSE
                    </span>
                  </td>
                  <td className="px-3 py-2 text-amber-700 font-semibold">
                    $2,100
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}


