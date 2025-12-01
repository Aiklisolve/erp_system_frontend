type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading data...' }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      <span>{label}</span>
    </div>
  );
}


