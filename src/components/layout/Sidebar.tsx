import { NavLink } from 'react-router-dom';

const groups = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard' }]
  },
  {
    label: 'Core Operations',
    items: [
      { to: '/finance', label: 'Finance' },
      { to: '/procurement', label: 'Procurement' },
      { to: '/manufacturing', label: 'Manufacturing' },
      { to: '/inventory', label: 'Inventory' },
      { to: '/orders', label: 'Orders' },
      { to: '/warehouse', label: 'Warehouse' },
      { to: '/supply-chain', label: 'Supply Chain' }
    ]
  },
  {
    label: 'People & HR',
    items: [
      { to: '/workforce', label: 'Workforce' },
      { to: '/hr', label: 'HR' }
    ]
  },
  {
    label: 'Sales & Growth',
    items: [
      { to: '/crm', label: 'CRM' },
      { to: '/ecommerce', label: 'Ecommerce' },
      { to: '/marketing', label: 'Marketing' },
      { to: '/projects', label: 'Projects' }
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-slate-200 bg-slate-50/90">
      <nav className="mt-2 flex-1 space-y-4 px-3 py-4 text-xs">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                      isActive
                        ? 'bg-brand-light/10 text-brand-dark border border-brand/40'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-brand border border-transparent'
                    ].join(' ')
                  }
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-500">
                    {item.label[0]}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


