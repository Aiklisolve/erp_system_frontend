import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform transition-shadow duration-150 hover:shadow-md hover:-translate-y-[2px] ${className}`}
      {...rest}
    />
  );
}


