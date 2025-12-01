import type { ERPModule } from '../types';

export const erpModules: ERPModule[] = [
  {
    id: 1,
    slug: 'finance',
    name: 'Finance',
    icon: 'Banknote',
    shortDescription: 'General ledger, AP/AR, and cash management in one real-time ledger.',
    description:
      'Centralize your financial operations with a single source of truth for ledgers, receivables, payables, cash, and reporting. Close faster and with more confidence.',
    keyFeatures: [
      'Multi-entity general ledger with flexible chart of accounts',
      'Automated accounts receivable and accounts payable workflows',
      'Cash management with rolling 13-week cash flow forecasting',
      'Configurable financial statements and drill-down reports'
    ],
    sampleKPIs: [
      { label: 'Days Sales Outstanding (DSO)', value: '42 days', trend: 'down' },
      { label: 'Days Payable Outstanding (DPO)', value: '37 days', trend: 'flat' },
      { label: 'Month-End Close Time', value: '3.5 days', trend: 'up' }
    ]
  },
  {
    id: 2,
    slug: 'procurement',
    name: 'Procurement',
    icon: 'ShoppingCart',
    shortDescription:
      'Source, approve, and track spend with supplier and contract visibility.',
    description:
      'Run procurement from requisition through purchase order and supplier invoice. Gain control of spend, supplier performance, and approvals.',
    keyFeatures: [
      'Requisition to PO workflow with configurable approvals',
      'Supplier catalogs, contracts, and preferred vendor policies',
      'Three-way matching between PO, receipt, and invoice',
      'Spend analytics by category, supplier, and department'
    ],
    sampleKPIs: [
      { label: 'Purchase Order Cycle Time', value: '1.8 days', trend: 'up' },
      { label: 'On-Contract Spend', value: '82%', trend: 'up' },
      { label: 'Supplier On-Time Delivery', value: '94%', trend: 'flat' }
    ]
  },
  {
    id: 3,
    slug: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    shortDescription:
      'Plan, schedule, and execute production with real-time shop floor visibility.',
    description:
      'Connect material planning, production orders, and labor tracking so planners and supervisors can respond to constraints in minutes, not days.',
    keyFeatures: [
      'Bill of materials (BOM) and routing management',
      'Finite-capacity production planning and scheduling',
      'Real-time work-in-progress and machine status',
      'Backflush and time reporting from the shop floor'
    ],
    sampleKPIs: [
      { label: 'Overall Equipment Effectiveness (OEE)', value: '86%', trend: 'up' },
      { label: 'First Pass Yield', value: '97%', trend: 'up' },
      { label: 'Scrap Rate', value: '1.8%', trend: 'down' }
    ]
  },
  {
    id: 4,
    slug: 'inventory-management',
    name: 'Inventory Management',
    icon: 'Boxes',
    shortDescription:
      'Track stock across locations with real-time levels, reservations, and costing.',
    description:
      'Eliminate stockouts and excess inventory with accurate on-hand balances, reservations, and intelligent replenishment policies across all locations.',
    keyFeatures: [
      'Multi-location, lot, and serial tracking',
      'Reorder points with min/max and safety stock policies',
      'Real-time availability by site, location, and status',
      'Support for standard, FIFO, and moving average costing'
    ],
    sampleKPIs: [
      { label: 'Inventory Turnover', value: '7.2x', trend: 'up' },
      { label: 'Stockout Incidents', value: '3 / month', trend: 'down' },
      { label: 'Carrying Cost of Inventory', value: '$420K', trend: 'down' }
    ]
  },
  {
    id: 5,
    slug: 'order-management',
    name: 'Order Management',
    icon: 'ClipboardList',
    shortDescription:
      'Quoting, order capture, and invoicing that connect sales to fulfillment.',
    description:
      'Handle the full order lifecycle—from quote to cash—while keeping customer promises on pricing, delivery dates, and fulfillment status.',
    keyFeatures: [
      'Quote-to-order conversion with approvals and discount controls',
      'Real-time available-to-promise (ATP) and capable-to-promise (CTP)',
      'Flexible pricing, promotions, and contract terms',
      'Integrated invoicing and payment capture'
    ],
    sampleKPIs: [
      { label: 'Order Fulfillment Rate', value: '98.3%', trend: 'up' },
      { label: 'Perfect Order Rate', value: '96.1%', trend: 'up' },
      { label: 'Order Cycle Time', value: '1.9 days', trend: 'down' }
    ]
  },
  {
    id: 6,
    slug: 'warehouse-management',
    name: 'Warehouse Management',
    icon: 'Warehouse',
    shortDescription:
      'Bin-level control, wave picking, and mobile workflows for efficient warehouses.',
    description:
      'Optimize inbound, storage, and outbound processes with directed put-away, picking strategies, and mobile scanning.',
    keyFeatures: [
      'Bin and zone management with configurable rules',
      'Directed put-away, picking waves, and replenishment tasks',
      'Mobile RF workflows for receipts, moves, and picks',
      'Cycle counting and physical inventory support'
    ],
    sampleKPIs: [
      { label: 'Lines Picked per Hour', value: '185', trend: 'up' },
      { label: 'Warehouse Utilization', value: '88%', trend: 'flat' },
      { label: 'Picking Accuracy', value: '99.5%', trend: 'up' }
    ]
  },
  {
    id: 7,
    slug: 'supply-chain-management',
    name: 'Supply Chain Management',
    icon: 'Network',
    shortDescription:
      'Plan demand and supply with end-to-end visibility from supplier to customer.',
    description:
      'Coordinate demand planning, supply planning, and logistics to ensure materials and products flow reliably across your network.',
    keyFeatures: [
      'Demand forecasting with historical and external signals',
      'Supply planning across plants, suppliers, and DCs',
      'What-if simulations for constraints and disruptions',
      'Control tower dashboards with exception-based alerts'
    ],
    sampleKPIs: [
      { label: 'Forecast Accuracy (MAPE)', value: '89%', trend: 'up' },
      { label: 'On-Time In-Full (OTIF)', value: '95%', trend: 'up' },
      { label: 'Expedited Freight Spend', value: '$32K / month', trend: 'down' }
    ]
  },
  {
    id: 8,
    slug: 'crm',
    name: 'Customer Relationship Management (CRM)',
    icon: 'Users',
    shortDescription:
      'Track leads, opportunities, and accounts with a 360° customer view.',
    description:
      'Align sales and service teams around a single source of customer truth, including pipeline, interactions, and open issues.',
    keyFeatures: [
      'Lead, opportunity, and pipeline management',
      'Account and contact 360° profile with ERP data',
      'Activity tracking for emails, calls, and meetings',
      'Configurable sales stages, territories, and quotas'
    ],
    sampleKPIs: [
      { label: 'Pipeline Coverage', value: '3.4x quota', trend: 'up' },
      { label: 'Lead-to-Opportunity Conversion', value: '28%', trend: 'up' },
      { label: 'Customer Churn Rate', value: '4.1%', trend: 'down' }
    ]
  },
  {
    id: 9,
    slug: 'project-management',
    name: 'Project Service Resource Management',
    icon: 'CalendarClock',
    shortDescription:
      'Plan projects, allocate resources, and track time and expenses in real-time.',
    description:
      'Deliver profitable projects with connected budgets, resource schedules, and actuals for time, expense, and materials.',
    keyFeatures: [
      'Project templates, budgets, and task breakdowns',
      'Resource planning with skills and availability',
      'Time and expense entry with approvals',
      'WIP, revenue recognition, and project profitability tracking'
    ],
    sampleKPIs: [
      { label: 'Project Margin', value: '24%', trend: 'up' },
      { label: 'Billable Utilization', value: '78%', trend: 'up' },
      { label: 'On-Time Milestone Delivery', value: '92%', trend: 'flat' }
    ]
  },
  {
    id: 10,
    slug: 'workforce-management',
    name: 'Workforce Management',
    icon: 'Clock',
    shortDescription:
      'Scheduling, time, and attendance to match labor to demand across operations.',
    description:
      'Give operations and HR teams a shared view of schedules, shifts, and time so labor cost matches demand without burning out teams.',
    keyFeatures: [
      'Shift planning and demand-based scheduling',
      'Time and attendance capture with rules',
      'Overtime and compliance tracking',
      'Labor cost dashboards by department and location'
    ],
    sampleKPIs: [
      { label: 'Schedule Adherence', value: '93%', trend: 'up' },
      { label: 'Overtime as % of Payroll', value: '6.4%', trend: 'down' },
      { label: 'Unplanned Absence Rate', value: '2.3%', trend: 'flat' }
    ]
  },
  {
    id: 11,
    slug: 'hr-management',
    name: 'Human Resources Management',
    icon: 'IdCard',
    shortDescription:
      'Core HR, org structures, and employee lifecycle management for every worker.',
    description:
      'Maintain accurate people data, org structures, and lifecycle events in a system that syncs with payroll and workforce tools.',
    keyFeatures: [
      'People profiles, positions, and organizational structures',
      'Onboarding, offboarding, and internal transfer workflows',
      'Leave and absence management with policies',
      'Compliance, documents, and audit trails'
    ],
    sampleKPIs: [
      { label: 'Time-to-Hire', value: '32 days', trend: 'down' },
      { label: 'Voluntary Turnover', value: '7.8%', trend: 'flat' },
      { label: 'Offer Acceptance Rate', value: '91%', trend: 'up' }
    ]
  },
  {
    id: 12,
    slug: 'ecommerce',
    name: 'Ecommerce',
    icon: 'Globe',
    shortDescription:
      'Connect online storefronts to inventory, pricing, and fulfillment in ERP.',
    description:
      'Unify your ecommerce channels with ERP so inventory, pricing, and orders stay in sync across B2B and B2C storefronts.',
    keyFeatures: [
      'Product catalog and pricing shared with ERP',
      'Real-time stock and reservations from inventory',
      'Order import, tax calculation, and payments',
      'Support for multiple stores, currencies, and regions'
    ],
    sampleKPIs: [
      { label: 'Conversion Rate', value: '3.6%', trend: 'up' },
      { label: 'Cart Abandonment Rate', value: '62%', trend: 'down' },
      { label: 'Average Order Value', value: '$148', trend: 'up' }
    ]
  },
  {
    id: 13,
    slug: 'marketing-automation',
    name: 'Marketing Automation',
    icon: 'Sparkles',
    shortDescription:
      'Run campaigns, nurture journeys, and measure revenue impact from marketing.',
    description:
      'Automate campaigns and journeys that use ERP and CRM data for better targeting, and connect results all the way to revenue.',
    keyFeatures: [
      'Email, in-app, and SMS campaign orchestration',
      'Segment builder using ERP, CRM, and behavioral data',
      'Lead scoring and routing to sales teams',
      'Attribution and ROI analytics by campaign and channel'
    ],
    sampleKPIs: [
      { label: 'Campaign Response Rate', value: '18%', trend: 'up' },
      { label: 'Marketing Sourced Pipeline', value: '$3.2M', trend: 'up' },
      { label: 'Cost per Qualified Lead', value: '$86', trend: 'down' }
    ]
  }
];


