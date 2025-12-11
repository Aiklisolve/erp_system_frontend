import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRolePermissions } from '../../features/auth/hooks/useRolePermissions';

// Icon mapping for menu items
const menuIcons: Record<string, string> = {
  'Dashboard': '📊',
  'Finance': '💼',
  'Procurement': '📥',
  'Manufacturing': '🏭',
  'Inventory': '📦',
  'Orders': '🧾',
  'Warehouse': '🏬',
  'Supply Chain': '🚚',
  'Workforce': '👥',
  'HR': '👔',
  'CRM': '🧑‍💼',
  'Ecommerce': '🛒',
  'Marketing': '📣',
  'Projects': '📋',
  'Reports': '📈',
  'Invoices': '💰',
  'Internal Tasks': '✅'
};

const allGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/reports', label: 'Reports' },
      { to: '/invoices', label: 'Invoices' }
    ]
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
  },
  {
    label: 'Internal Management',
    items: [
      { to: '/internal-tasks', label: 'Internal Tasks' }
    ]
  }
];

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { canAccess } = useRolePermissions();
  const [isHovered, setIsHovered] = useState(false);

  // Filter groups to show only modules user has access to
  const filteredGroups = allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.to as any))
    }))
    .filter((group) => group.items.length > 0); // Only show groups with at least one accessible item

  return (
    <>
      {/* Desktop Sidebar - Collapsible on Hover */}
      <aside
        className="hidden md:block fixed left-0 top-[57px] h-[calc(100vh-57px)] z-30 transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`h-full bg-white border-r-2 border-slate-300 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
            isHovered ? 'w-60' : 'w-16'
          }`}
        >
          <nav className={`mt-2 flex-1 space-y-4 py-4 text-xs overflow-y-auto h-full transition-all duration-300 custom-scrollbar ${
            isHovered ? 'px-3' : 'px-2'
          }`}>
            {filteredGroups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                {isHovered ? (
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary whitespace-nowrap">
                    {group.label}
                  </p>
                ) : (
                  <div className="h-4" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const icon = menuIcons[item.label] || '📦';
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          [
                            'flex items-center rounded-lg text-[11px] font-medium transition-all duration-200 group',
                            isHovered ? 'gap-2 px-2.5 py-1.5' : 'justify-center px-2 py-1.5',
                            isActive
                              ? 'bg-primary-light/10 text-primary border border-primary/40 shadow-sm'
                              : 'text-text-secondary hover:bg-slate-100 hover:text-primary border border-transparent hover:shadow-sm'
                          ].join(' ')
                        }
                        title={!isHovered ? item.label : undefined}
                      >
                        <span className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 text-text-secondary flex-shrink-0 transition-all duration-200 shadow-md overflow-hidden ${
                          isHovered ? 'h-7 w-7' : 'h-10 w-10'
                        } group-hover:scale-110 group-hover:shadow-lg`}>
                          <span className={`drop-shadow-sm leading-none ${isHovered ? 'text-lg' : 'text-xl'}`} style={{ fontSize: isHovered ? '1.125rem' : '1.25rem' }}>{icon}</span>
                        </span>
                        <span
                          className={`whitespace-nowrap transition-all duration-300 font-semibold ${
                            isHovered 
                              ? 'opacity-100 ml-2' 
                              : 'opacity-0 w-0 overflow-hidden ml-0'
                          }`}
                        >
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-primary-light/10 to-transparent">
          <h2 className="text-sm font-bold text-slate-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 space-y-4 px-3 py-4 text-xs overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          {filteredGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const icon = menuIcons[item.label] || '📦';
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        // Close mobile sidebar when link is clicked
                        if (onClose) onClose();
                      }}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary-light/10 text-primary border border-primary/40 shadow-sm'
                            : 'text-text-secondary hover:bg-slate-100 hover:text-primary border border-transparent'
                        ].join(' ')
                      }
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 shadow-md flex-shrink-0 overflow-hidden">
                        <span className="drop-shadow-sm text-lg leading-none" style={{ fontSize: '1.125rem' }}>{icon}</span>
                      </span>
                      <span className="font-semibold">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}


