import { Card } from './Card';
import { Badge } from './Badge';

type Trend = 'up' | 'down' | 'flat';
type StatVariant = 'teal' | 'blue' | 'yellow' | 'purple' | 'neutral' | 'green' | 'orange' | 'red' | 'indigo' | 'cyan';

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
      bg: 'bg-gradient-to-br from-teal-50 via-white to-teal-100',
      value: 'text-teal-700'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-100',
      value: 'text-blue-700'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100',
      value: 'text-yellow-700'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 via-white to-purple-100',
      value: 'text-purple-700'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 via-white to-green-100',
      value: 'text-green-700'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 via-white to-orange-100',
      value: 'text-orange-700'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 via-white to-red-100',
      value: 'text-red-700'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100',
      value: 'text-indigo-700'
    },
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-50 via-white to-cyan-100',
      value: 'text-cyan-700'
    },
    neutral: {
      bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      value: 'text-slate-800'
    }
  };

  const colors = palette[variant];

  return (
    <Card className={`space-y-2 border-none shadow-sm ${colors.bg} min-w-0`}>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <p className="text-xs font-medium text-slate-600 flex-1 leading-tight break-words">{label}</p>
        <Badge
          variant="solid"
          tone={trend === 'down' ? 'neutral' : 'brand'}
          className="uppercase tracking-wide flex-shrink-0 text-[9px] sm:text-[10px] mt-0.5"
        >
          {TREND_LABEL[trend]}
        </Badge>
      </div>
      <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold ${colors.value} break-all leading-tight whitespace-normal`}>{value}</p>
      {helper && <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">{helper}</p>}
    </Card>
  );
}


