import { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block text-[11px] font-semibold text-slate-800">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}


