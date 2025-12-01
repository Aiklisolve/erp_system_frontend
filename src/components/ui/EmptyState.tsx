type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-300">
      <p className="font-medium text-slate-100">{title}</p>
      {description && <p className="mt-1 text-[11px] text-slate-500">{description}</p>}
    </div>
  );
}


