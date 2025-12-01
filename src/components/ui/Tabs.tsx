import { ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
};

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div className="border-b border-slate-200 text-[11px]">
      <div className="flex gap-4">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative -mb-px pb-2 px-1 flex items-center gap-1 font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


