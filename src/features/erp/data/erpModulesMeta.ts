export type ErpModuleMeta = {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  primaryRoute: string;
  primaryEntityName: string;
};

export const erpModulesMeta: ErpModuleMeta[] = [
  {
    id: 1,
    slug: 'finance',
    name: 'Finance',
    description: 'Transactions, ledgers, and real-time financial insights.',
    icon: 'finance',
    primaryRoute: '/finance',
    primaryEntityName: 'Transactions'
  },
  {
    id: 2,
    slug: 'procurement',
    name: 'Procurement',
    description: 'Purchase orders, suppliers, and spend control.',
    icon: 'procurement',
    primaryRoute: '/procurement',
    primaryEntityName: 'Purchase Orders'
  },
  {
    id: 3,
    slug: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production orders and shop-floor progress.',
    icon: 'manufacturing',
    primaryRoute: '/manufacturing',
    primaryEntityName: 'Production Orders'
  },
  {
    id: 4,
    slug: 'inventory',
    name: 'Inventory Management',
    description: 'On-hand stock, locations, and replenishment.',
    icon: 'inventory',
    primaryRoute: '/inventory',
    primaryEntityName: 'Inventory Items'
  },
  {
    id: 5,
    slug: 'orders',
    name: 'Order Management',
    description: 'Sales orders from quote to cash.',
    icon: 'orders',
    primaryRoute: '/orders',
    primaryEntityName: 'Sales Orders'
  },
  {
    id: 6,
    slug: 'warehouse',
    name: 'Warehouse Management',
    description: 'Bin-level movements and warehouse execution.',
    icon: 'warehouse',
    primaryRoute: '/warehouse',
    primaryEntityName: 'Stock Movements'
  },
  {
    id: 7,
    slug: 'supply-chain',
    name: 'Supply Chain Management',
    description: 'Suppliers, inbound performance, and risk.',
    icon: 'supplyChain',
    primaryRoute: '/supply-chain',
    primaryEntityName: 'Suppliers'
  },
  {
    id: 8,
    slug: 'crm',
    name: 'CRM',
    description: 'Accounts, contacts, and opportunities.',
    icon: 'crm',
    primaryRoute: '/crm',
    primaryEntityName: 'Customers'
  },
  {
    id: 9,
    slug: 'projects',
    name: 'Project Management',
    description: 'Project portfolios, budgets, and delivery.',
    icon: 'projects',
    primaryRoute: '/projects',
    primaryEntityName: 'Projects'
  },
  {
    id: 10,
    slug: 'workforce',
    name: 'Workforce Management',
    description: 'Shifts, roles, and workforce coverage.',
    icon: 'workforce',
    primaryRoute: '/workforce',
    primaryEntityName: 'Shifts'
  },
  {
    id: 11,
    slug: 'hr',
    name: 'HR Management',
    description: 'Employees, departments, and leave.',
    icon: 'hr',
    primaryRoute: '/hr',
    primaryEntityName: 'Employees'
  },
  {
    id: 12,
    slug: 'ecommerce',
    name: 'Ecommerce',
    description: 'Products and online orders linked to ERP.',
    icon: 'ecommerce',
    primaryRoute: '/ecommerce',
    primaryEntityName: 'Products & Orders'
  },
  {
    id: 13,
    slug: 'marketing',
    name: 'Marketing Automation',
    description: 'Campaigns, journeys, and performance.',
    icon: 'marketing',
    primaryRoute: '/marketing',
    primaryEntityName: 'Campaigns'
  }
];


