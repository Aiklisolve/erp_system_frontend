import { Card } from '../../../components/ui/Card';

const HIGHLIGHTS = [
  {
    title: 'Unified Finance',
    body: 'Consolidate ledgers, receivables, and payables for faster month-end close across every entity.',
    tag: 'Finance'
  },
  {
    title: 'Real-time Inventory',
    body: 'See stock levels and reservations in real time across plants, warehouses, and stores.',
    tag: 'Inventory'
  },
  {
    title: 'Connected CRM',
    body: 'Give sales and service teams a 360° view that blends ERP, CRM, and support data.',
    tag: 'CRM'
  },
  {
    title: 'Projects & Workforce',
    body: 'Align project profitability with labor utilization and time tracking in a single workspace.',
    tag: 'Projects'
  }
];

export function ModuleSummaryCards() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {HIGHLIGHTS.map((item) => (
        <Card
          key={item.title}
          className="space-y-1.5 bg-slate-950/40 border-slate-800/80 hover:border-emerald-400/60 transition-colors"
        >
          <p className="text-[11px] uppercase tracking-wide text-emerald-300">
            {item.tag}
          </p>
          <h3 className="text-sm font-semibold text-slate-50">{item.title}</h3>
          <p className="text-xs text-slate-300">{item.body}</p>
        </Card>
      ))}
    </div>
  );
}


