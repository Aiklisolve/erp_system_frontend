type SkeletonLoaderProps = {
  variant?: 'statCard' | 'barChart' | 'pieChart' | 'circularProgress' | 'text' | 'line';
  className?: string;
  count?: number;
};

export function SkeletonLoader({ 
  variant = 'text', 
  className = '',
  count = 1 
}: SkeletonLoaderProps) {
  if (variant === 'statCard') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="h-8 sm:h-10 md:h-12 w-24 bg-slate-300 rounded animate-pulse"></div>
        <div className="h-2.5 w-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (variant === 'barChart') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
        <div className="flex items-end gap-2 h-24">
          {Array.from({ length: count || 5 }).map((_, idx) => {
            const heights = [60, 80, 45, 70, 55, 65, 50];
            const height = heights[idx % heights.length];
            return (
              <div
                key={idx}
                className="flex-1 rounded-t-full bg-gradient-to-t from-slate-200 to-slate-300 animate-pulse"
                style={{ 
                  height: `${height}%`,
                  animationDelay: `${idx * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: count || 5 }).map((_, idx) => (
            <div key={idx} className="h-2 w-6 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pieChart') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div className="relative h-48 w-48">
          <div className="absolute inset-0 rounded-full border-8 border-slate-200 animate-pulse"></div>
          <div className="absolute inset-8 rounded-full bg-slate-100 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="space-y-2 w-full">
          {Array.from({ length: count || 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}></div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}></div>
              </div>
              <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'circularProgress') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-slate-100 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count || 3 }).map((_, idx) => (
          <div 
            key={idx} 
            className="h-3 bg-slate-200 rounded animate-pulse" 
            style={{ 
              width: `${80 + (idx * 10)}%`,
              animationDelay: `${idx * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    );
  }

  // Default text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="h-4 bg-slate-200 rounded animate-pulse" 
          style={{ 
            width: idx === count - 1 ? '60%' : '100%',
            animationDelay: `${idx * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  );
}
