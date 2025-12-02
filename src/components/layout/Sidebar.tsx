import { NavLink } from 'react-router-dom';
import { useRolePermissions } from '../../features/auth/hooks/useRolePermissions';

const allGroups = [
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
  const { canAccess } = useRolePermissions();

  // Filter groups to show only modules user has access to
  const filteredGroups = allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.to as any))
    }))
    .filter((group) => group.items.length > 0); // Only show groups with at least one accessible item

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-slate-200 bg-card/90">
      <nav className="mt-2 flex-1 space-y-4 px-3 py-4 text-xs">
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                      isActive
                        ? 'bg-primary-light/10 text-primary border border-primary/40'
                        : 'text-text-secondary hover:bg-slate-100 hover:text-primary border border-transparent'
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


