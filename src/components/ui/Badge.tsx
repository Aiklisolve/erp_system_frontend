import { ReactNode } from 'react';

type BadgeVariant = 'solid' | 'outline';
type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({
  children,
  variant = 'solid',
  tone = 'neutral',
  className = ''
}: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap';

  const tones: Record<BadgeTone, Record<BadgeVariant, string>> = {
    brand: {
      solid: 'bg-primary-light/10 text-primary border border-primary/40',
      outline: 'border border-primary/40 text-primary'
    },
    neutral: {
      solid: 'bg-slate-100 text-slate-700 border border-slate-200',
      outline: 'border border-slate-200 text-slate-700'
    },
    success: {
      solid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      outline: 'border border-emerald-200 text-emerald-700'
    },
    warning: {
      solid: 'bg-amber-50 text-amber-700 border border-amber-200',
      outline: 'border border-amber-200 text-amber-700'
    },
    danger: {
      solid: 'bg-red-50 text-red-700 border border-red-200',
      outline: 'border border-red-200 text-red-700'
    }
  };

  return (
    <span className={`${base} ${tones[tone][variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}


