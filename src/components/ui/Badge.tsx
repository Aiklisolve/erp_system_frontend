import { ReactNode } from 'react';

type BadgeVariant = 'solid' | 'outline';
type BadgeTone = 'brand' | 'neutral';

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
      solid: 'bg-emerald-500/10 text-emerald-800 border border-emerald-400/60',
      outline: 'border border-emerald-400/60 text-emerald-700'
    },
    neutral: {
      solid: 'bg-slate-100 text-slate-800 border border-slate-300',
      outline: 'border border-slate-300 text-slate-600'
    }
  };

  return (
    <span className={`${base} ${tones[tone][variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}


