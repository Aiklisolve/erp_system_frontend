import { Link, useLocation } from 'react-router-dom';

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items = [
    { label: 'Dashboard', to: '/dashboard' },
    ...segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      return {
        label: segment.replace('-', ' '),
        to: path
      };
    })
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-[11px] text-slate-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.to}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span className="text-slate-600">/</span>}
              {isLast ? (
                <span className="font-medium text-slate-200 capitalize">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-emerald-300 transition-colors capitalize"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


