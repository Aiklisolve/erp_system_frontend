import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
          className={`h-full bg-gradient-to-b from-white via-slate-50/50 to-white border-r-2 border-slate-200/80 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-sm ${
            isHovered ? 'w-64' : 'w-16'
          }`}
          style={{
            boxShadow: isHovered 
              ? '4px 0 20px rgba(13, 148, 136, 0.08), 0 0 0 1px rgba(13, 148, 136, 0.05)' 
              : '2px 0 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Decorative top accent */}
          <div className="h-1 bg-gradient-to-r from-primary via-teal-500 to-primary-light"></div>
          
          <nav className={`mt-3 flex-1 space-y-5 py-4 text-xs overflow-y-auto h-[calc(100%-4px)] transition-all duration-300 custom-scrollbar ${
            isHovered ? 'px-4' : 'px-2'
          }`}>
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.label} className="space-y-2" style={{ animationDelay: `${groupIndex * 50}ms` }}>
                {isHovered ? (
                  <div className="px-3 py-1.5 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap flex items-center gap-2">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></span>
                      <span>{group.label}</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></span>
                    </p>
                  </div>
                ) : (
                  <div className="h-6 flex items-center justify-center">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const icon = menuIcons[item.label] || '📦';
                    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={[
                          'flex items-center rounded-xl text-[11px] font-semibold transition-all duration-300 group relative',
                          isHovered ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                          isActive
                            ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary border-l-4 border-primary shadow-md shadow-primary/10'
                            : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:via-slate-50/50 hover:to-transparent hover:text-primary border-l-4 border-transparent hover:border-primary/30 hover:shadow-sm'
                        ].join(' ')}
                        title={!isHovered ? item.label : undefined}
                        style={{ animationDelay: `${(groupIndex * 50) + (itemIndex * 30)}ms` }}
                      >
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-primary via-primary-light to-primary rounded-r-full"></div>
                        )}
                        
                        <span className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 border-2 text-text-secondary flex-shrink-0 transition-all duration-300 shadow-sm overflow-hidden relative ${
                          isHovered ? 'h-8 w-8' : 'h-9 w-9'
                        } ${
                          isActive 
                            ? 'border-primary/40 shadow-md shadow-primary/20 scale-105' 
                            : 'border-slate-200 group-hover:border-primary/30 group-hover:scale-110 group-hover:shadow-md'
                        }`}>
                          <span className={`drop-shadow-sm leading-none transition-transform duration-300 ${
                            isHovered ? 'text-base' : 'text-lg'
                          } group-hover:scale-110`} style={{ fontSize: isHovered ? '1rem' : '1.125rem' }}>
                            {icon}
                          </span>
                          {/* Glow effect on hover */}
                          <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/0 transition-all duration-300"></span>
                        </span>
                        <span
                          className={`whitespace-nowrap transition-all duration-300 font-semibold relative ${
                            isHovered 
                              ? 'opacity-100 ml-2 translate-x-0' 
                              : 'opacity-0 w-0 overflow-hidden ml-0 -translate-x-2'
                          }`}
                        >
                          {item.label}
                          {/* Underline effect on hover */}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-light group-hover:w-full transition-all duration-300"></span>
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
          fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-white via-slate-50/50 to-white shadow-2xl transform transition-transform duration-300 ease-in-out backdrop-blur-sm
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          boxShadow: '4px 0 30px rgba(13, 148, 136, 0.15), 0 0 0 1px rgba(13, 148, 136, 0.1)'
        }}
      >
        {/* Mobile header */}
        <div className="relative flex items-center justify-between p-5 border-b-2 border-slate-200/80 bg-gradient-to-r from-primary/5 via-primary-light/10 to-transparent">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-teal-500 to-primary-light"></div>
          <h2 className="text-base font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
            ERP Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 hover:scale-110 active:scale-95"
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
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 space-y-5 px-4 py-5 text-xs overflow-y-auto h-[calc(100vh-73px)] custom-scrollbar">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-2">
              <div className="px-3 py-2 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></span>
                  <span>{group.label}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></span>
                </p>
              </div>
              <div className="space-y-1.5">
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
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all duration-300 relative',
                          isActive
                            ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary border-l-4 border-primary shadow-md shadow-primary/10'
                            : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:via-slate-50/50 hover:to-transparent hover:text-primary border-l-4 border-transparent hover:border-primary/30 hover:shadow-sm'
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-primary via-primary-light to-primary rounded-r-full"></div>
                      )}
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-sm flex-shrink-0 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:scale-110 hover:shadow-md">
                        <span className="drop-shadow-sm text-base leading-none transition-transform duration-300 hover:scale-110" style={{ fontSize: '1rem' }}>
                          {icon}
                        </span>
                      </span>
                      <span className="font-semibold relative">
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-light group-hover:w-full transition-all duration-300"></span>
                      </span>
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


