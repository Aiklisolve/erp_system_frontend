import { ReactNode } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warning' | 'error';
};

const toneStyles: Record<
  NonNullable<ToastProps['tone']>,
  { border: string; badge: string }
> = {
  info: {
    border: 'border-sky-300',
    badge: 'bg-sky-100 text-sky-800'
  },
  success: {
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  warning: {
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800'
  },
  error: {
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-800'
  }
};

export function ToastContainer({ children }: { children?: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-2">{children}</div>
    </div>
  );
}

export function Toast({ title, description, tone = 'info' }: ToastProps) {
  const styles = toneStyles[tone];
  return (
    <div
      className={`pointer-events-auto rounded-xl border bg-white px-3 py-2 shadow-sm animate-fade-in ${styles.border}`}
    >
      <div className="flex items-start gap-2 text-[11px]">
        <span
          className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}
        >
          {tone.toUpperCase()}
        </span>
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{title}</p>
          {description && (
            <p className="text-[10px] text-slate-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}


