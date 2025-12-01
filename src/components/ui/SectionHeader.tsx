type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="text-sm md:text-base text-slate-600 max-w-2xl">{description}</p>
      )}
    </div>
  );
}


