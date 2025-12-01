import { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
};

export function Textarea({ label, helperText, className = '', ...rest }: TextareaProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block text-[11px] font-semibold text-slate-800">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        {...rest}
      />
      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}


