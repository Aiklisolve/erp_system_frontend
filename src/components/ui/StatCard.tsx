import { Card } from './Card';
import { Badge } from './Badge';

type Trend = 'up' | 'down' | 'flat';
type StatVariant = 'teal' | 'blue' | 'yellow' | 'purple' | 'neutral';

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  trend?: Trend;
  variant?: StatVariant;
};

const TREND_LABEL: Record<Trend, string> = {
  up: 'Improving',
  down: 'Reduced',
  flat: 'Stable'
};

export function StatCard({
  label,
  value,
  helper,
  trend = 'up',
  variant = 'neutral'
}: StatCardProps) {
  const palette: Record<StatVariant, { bg: string; value: string }> = {
    teal: {
      bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100',
      value: 'text-emerald-700'
    },
    blue: {
      bg: 'bg-gradient-to-br from-sky-50 via-white to-sky-100',
      value: 'text-sky-700'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-50 via-white to-amber-100',
      value: 'text-amber-700'
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-50 via-white to-violet-100',
      value: 'text-violet-700'
    },
    neutral: {
      bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      value: 'text-slate-800'
    }
  };

  const colors = palette[variant];

  return (
    <Card className={`space-y-2 border-none shadow-sm ${colors.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <Badge
          variant="solid"
          tone={trend === 'down' ? 'neutral' : 'brand'}
          className="uppercase tracking-wide"
        >
          {TREND_LABEL[trend]}
        </Badge>
      </div>
      <p className={`text-2xl md:text-3xl font-semibold ${colors.value}`}>{value}</p>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
    </Card>
  );
}


