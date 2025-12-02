import { Link } from 'react-router-dom';
import type { ErpModuleMeta } from '../data/erpModulesMeta';
import { Card } from '../../../components/ui/Card';

type ModuleCardProps = {
  module: ErpModuleMeta;
};

// Module icons mapping
const moduleIcons: Record<string, string> = {
  finance: '💼',
  procurement: '📥',
  manufacturing: '🏭',
  inventory: '📦',
  orders: '🧾',
  warehouse: '🏬',
  'supply-chain': '🚚',
  crm: '🧑‍💼',
  projects: '📊',
  workforce: '👥',
  hr: '👔',
  ecommerce: '🛒',
  marketing: '📣'
};

// Color schemes for each module
const moduleColors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  finance: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100'
  },
  procurement: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100'
  },
  manufacturing: {
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100'
  },
  inventory: {
    bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100'
  },
  orders: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    text: 'text-green-700',
    iconBg: 'bg-green-100'
  },
  warehouse: {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    iconBg: 'bg-slate-100'
  },
  'supply-chain': {
    bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    iconBg: 'bg-cyan-100'
  },
  crm: {
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    iconBg: 'bg-pink-100'
  },
  projects: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    iconBg: 'bg-violet-100'
  },
  workforce: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100'
  },
  hr: {
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100'
  },
  ecommerce: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    iconBg: 'bg-yellow-100'
  },
  marketing: {
    bg: 'bg-gradient-to-br from-red-50 to-pink-50',
    border: 'border-red-200',
    text: 'text-red-700',
    iconBg: 'bg-red-100'
  }
};

export function ModuleCard({ module }: ModuleCardProps) {
  const colors = moduleColors[module.slug] || moduleColors.finance;
  const icon = moduleIcons[module.slug] || '📦';

  return (
    <Link to={module.primaryRoute} className="block h-full w-full">
      <Card
        className={`group relative overflow-hidden border-2 ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-opacity-80 cursor-pointer h-full w-full flex flex-col min-h-[150px] sm:min-h-[160px]`}
      >
        <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col">
          {/* Icon and Title */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl ${colors.iconBg} text-xl sm:text-2xl lg:text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs sm:text-sm lg:text-base font-bold ${colors.text} group-hover:underline break-words`}>
                {module.name}
              </h3>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 mt-0.5 capitalize break-words">
                {module.primaryEntityName}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
            {module.description}
          </p>

          {/* Arrow indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-auto">
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-slate-500">
              Click to open
            </span>
            <div className={`text-base sm:text-lg lg:text-xl ${colors.text} group-hover:translate-x-1 transition-transform duration-300`}>
              →
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      </Card>
    </Link>
  );
}

