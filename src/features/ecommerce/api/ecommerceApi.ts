import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Product, OnlineOrder } from '../types';

let useStatic = !hasSupabaseConfig;

// Mock Products
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    product_code: 'PROD-2025-PRE001',
    sku: 'ERP-PREM-001',
    name: 'Premium ERP License',
    slug: 'premium-erp-license',
    short_description: 'Full-featured ERP system with all modules',
    description: 'Complete ERP solution with all 13 modules including Finance, Inventory, CRM, HR, and more.',
    category: 'Software',
    subcategory: 'ERP Systems',
    tags: ['ERP', 'Enterprise', 'Premium'],
    brand: 'OrbitERP',
    product_type: 'DIGITAL',
    status: 'ACTIVE',
    stock_status: 'IN_STOCK',
    price: 299.99,
    compare_at_price: 399.99,
    cost_price: 150.00,
    currency: 'USD',
    stock: 150,
    stock_quantity: 150,
    low_stock_threshold: 10,
    manage_stock: true,
    stock_location: 'Digital Warehouse',
    tax_status: 'TAXABLE',
    featured: true,
    on_sale: true,
    sale_start_date: '2025-01-01',
    sale_end_date: '2025-12-31',
    total_sales: 45,
    total_revenue: 13499.55,
    average_rating: 4.7,
    review_count: 23,
    created_at: '2025-01-01'
  },
  {
    id: 'prod-2',
    product_code: 'PROD-2025-BAS002',
    sku: 'ERP-BASIC-002',
    name: 'Basic ERP Subscription',
    slug: 'basic-erp-subscription',
    short_description: 'Essential ERP features for small businesses',
    description: 'Basic ERP subscription with core modules for small to medium businesses.',
    category: 'Software',
    subcategory: 'ERP Systems',
    tags: ['ERP', 'Basic', 'Subscription'],
    brand: 'OrbitERP',
    product_type: 'DIGITAL',
    status: 'OUT_OF_STOCK',
    stock_status: 'OUT_OF_STOCK',
    price: 99.99,
    compare_at_price: 149.99,
    cost_price: 50.00,
    currency: 'USD',
    stock: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    manage_stock: true,
    tax_status: 'TAXABLE',
    on_sale: true,
    total_sales: 120,
    total_revenue: 11998.80,
    average_rating: 4.2,
    review_count: 15,
    created_at: '2025-01-02'
  },
  {
    id: 'prod-3',
    product_code: 'PROD-2025-ENT003',
    sku: 'ERP-ENT-003',
    name: 'Enterprise Support Package',
    slug: 'enterprise-support-package',
    short_description: '24/7 support and dedicated account manager',
    description: 'Enterprise support package with 24/7 support, dedicated account manager, and priority assistance.',
    category: 'Services',
    subcategory: 'Support',
    tags: ['Support', 'Enterprise', 'Service'],
    brand: 'OrbitERP',
    product_type: 'SERVICE',
    status: 'ACTIVE',
    stock_status: 'ON_DEMAND',
    price: 499.99,
    cost_price: 200.00,
    currency: 'USD',
    stock: 25,
    stock_quantity: 25,
    manage_stock: false,
    tax_status: 'TAXABLE',
    featured: false,
    total_sales: 8,
    total_revenue: 3999.92,
    average_rating: 4.9,
    review_count: 5,
    created_at: '2025-01-03'
  },
  {
    id: 'prod-4',
    product_code: 'PROD-2025-HRD004',
    sku: 'ERP-HRD-004',
    name: 'Hardware ERP Terminal',
    slug: 'hardware-erp-terminal',
    short_description: 'Physical terminal for warehouse operations',
    description: 'Rugged hardware terminal designed for warehouse and inventory management operations.',
    category: 'Hardware',
    subcategory: 'Terminals',
    tags: ['Hardware', 'Warehouse', 'Terminal'],
    brand: 'OrbitERP',
    manufacturer: 'TechManufacturing Inc',
    product_type: 'SIMPLE',
    status: 'ACTIVE',
    stock_status: 'IN_STOCK',
    price: 899.99,
    compare_at_price: 1199.99,
    cost_price: 450.00,
    currency: 'USD',
    stock: 45,
    stock_quantity: 45,
    low_stock_threshold: 5,
    manage_stock: true,
    stock_location: 'Main Warehouse',
    weight: 2.5,
    length: 30,
    width: 20,
    height: 5,
    shipping_class: 'STANDARD',
    shipping_cost: 25.00,
    tax_status: 'TAXABLE',
    featured: true,
    on_sale: false,
    total_sales: 12,
    total_revenue: 10799.88,
    average_rating: 4.5,
    review_count: 8,
    created_at: '2025-01-04'
  }
];

// Mock Online Orders
const mockOrders: OnlineOrder[] = [
  {
    id: 'order-1',
    customer_name: 'Acme Corp',
    date: '2025-01-05',
    total_amount: 599.98,
    status: 'CONFIRMED',
    created_at: '2025-01-05'
  },
  {
    id: 'order-2',
    customer_name: 'Tech Solutions Inc',
    date: '2025-01-04',
    total_amount: 299.99,
    status: 'SHIPPED',
    created_at: '2025-01-04'
  }
];

function nextProductId() {
  return `prod-${Math.random().toString(36).slice(2, 8)}`;
}

function nextOrderId() {
  return `order-${Math.random().toString(36).slice(2, 8)}`;
}

// Product CRUD
export async function listProducts(): Promise<Product[]> {
  if (useStatic) return mockProducts;

  try {
    const { data, error } = await supabase.from('ecommerce_products').select('*');
    if (error) throw error;
    return (data as Product[]) ?? [];
  } catch (error) {
    handleApiError('ecommerce.listProducts', error);
    useStatic = true;
    return mockProducts;
  }
}

export async function createProduct(
  payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<Product> {
  if (useStatic) {
    const product: Product = {
      ...payload,
      id: nextProductId(),
      created_at: new Date().toISOString()
    };
    mockProducts.unshift(product);
    return product;
  }

  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  } catch (error) {
    handleApiError('ecommerce.createProduct', error);
    useStatic = true;
    return createProduct(payload);
  }
}

export async function updateProduct(
  id: string,
  changes: Partial<Product>
): Promise<Product | null> {
  if (useStatic) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProducts[index] = { ...mockProducts[index], ...changes };
    return mockProducts[index];
  }

  try {
    const { data, error } = await supabase
      .from('ecommerce_products')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  } catch (error) {
    handleApiError('ecommerce.updateProduct', error);
    useStatic = true;
    return updateProduct(id, changes);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (useStatic) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) mockProducts.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('ecommerce_products').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('ecommerce.deleteProduct', error);
    useStatic = true;
    await deleteProduct(id);
  }
}

// Online Order CRUD
export async function listOnlineOrders(): Promise<OnlineOrder[]> {
  if (useStatic) return mockOrders;

  try {
    const { data, error } = await supabase.from('ecommerce_orders').select('*');
    if (error) throw error;
    return (data as OnlineOrder[]) ?? [];
  } catch (error) {
    handleApiError('ecommerce.listOnlineOrders', error);
    useStatic = true;
    return mockOrders;
  }
}

export async function createOnlineOrder(
  payload: Omit<OnlineOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<OnlineOrder> {
  if (useStatic) {
    const order: OnlineOrder = {
      ...payload,
      id: nextOrderId(),
      created_at: new Date().toISOString()
    };
    mockOrders.unshift(order);
    return order;
  }

  try {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as OnlineOrder;
  } catch (error) {
    handleApiError('ecommerce.createOnlineOrder', error);
    useStatic = true;
    return createOnlineOrder(payload);
  }
}

export async function updateOnlineOrder(
  id: string,
  changes: Partial<OnlineOrder>
): Promise<OnlineOrder | null> {
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    mockOrders[index] = { ...mockOrders[index], ...changes };
    return mockOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as OnlineOrder;
  } catch (error) {
    handleApiError('ecommerce.updateOnlineOrder', error);
    useStatic = true;
    return updateOnlineOrder(id, changes);
  }
}

export async function deleteOnlineOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index !== -1) mockOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('ecommerce_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('ecommerce.deleteOnlineOrder', error);
    useStatic = true;
    await deleteOnlineOrder(id);
  }
}

