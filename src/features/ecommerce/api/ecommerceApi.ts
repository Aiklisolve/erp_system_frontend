import { apiRequest } from '../../../config/api';
import { handleApiError } from '../../../lib/errorHandler';
import type { Product, OnlineOrder } from '../types';

const USE_BACKEND_API = true;

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
    currency: 'INR',
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
    currency: 'INR',
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
    currency: 'INR',
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
    currency: 'INR',
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
  if (!USE_BACKEND_API) return mockProducts;

  try {
    console.log('🔄 Fetching products from backend API...');
    const response = await apiRequest<{
      success: boolean;
      data: {
        products: Array<{
          id: number;
          product_code?: string;
          name: string;
          description?: string;
          category?: string;
          subcategory?: string;
          unit_of_measure?: string;
          cost_price?: number;
          selling_price?: number;
          tax_rate?: number;
          hsn_code?: string;
          barcode?: string;
          sku?: string;
          reorder_level?: number;
          reorder_quantity?: number;
          supplier_id?: number;
          is_active?: boolean;
          quantity_available?: number;
          created_at?: string;
          updated_at?: string;
        }>;
        pagination: any;
      };
    }>('/products?limit=1000');
    
    console.log('✅ Products API response:', response);
    console.log('📦 Products count:', response.data?.products?.length || 0);
    
    if (!response.data || !response.data.products) {
      console.error('❌ Invalid response structure:', response);
      return mockProducts;
    }
    
    const mappedProducts = response.data.products.map(p => ({
      id: String(p.id),
      product_code: p.product_code,
      sku: p.sku || p.product_code,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      unit_of_measure: p.unit_of_measure,
      cost_price: p.cost_price,
      price: p.selling_price || p.cost_price || 0,
      selling_price: p.selling_price,
      tax_rate: p.tax_rate,
      stock: p.quantity_available || 0,
      stock_quantity: p.quantity_available || 0,
      quantity_available: p.quantity_available || 0,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      stock_status: p.quantity_available && p.quantity_available > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      product_type: 'SIMPLE',
      currency: 'INR',
      created_at: p.created_at,
      updated_at: p.updated_at
    } as any));
    
    console.log('✅ Mapped products:', mappedProducts.length);
    return mappedProducts;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    handleApiError('ecommerce.listProducts', error);
    return mockProducts;
  }
}

export async function createProduct(
  payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<Product> {
  if (!USE_BACKEND_API) {
    const product: Product = {
      ...payload,
      id: nextProductId(),
      created_at: new Date().toISOString()
    };
    mockProducts.unshift(product);
    return product;
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      data: {
        id: number;
        product_code?: string;
        name: string;
        description?: string;
        category?: string;
        subcategory?: string;
        unit_of_measure?: string;
        cost_price?: number;
        selling_price?: number;
        tax_rate?: number;
        hsn_code?: string;
        barcode?: string;
        sku?: string;
        reorder_level?: number;
        reorder_quantity?: number;
        supplier_id?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    }>('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        subcategory: payload.subcategory,
        unit_of_measure: (payload as any).unit_of_measure,
        cost_price: payload.cost_price,
        selling_price: payload.selling_price || payload.price,
        tax_rate: (payload as any).tax_rate,
        reorder_level: (payload as any).reorder_level,
        reorder_quantity: (payload as any).reorder_quantity,
        supplier_id: (payload as any).supplier_id,
        is_active: payload.status === 'ACTIVE',
        quantity_on_hand: payload.stock || payload.stock_quantity || 0,
        warehouse_id: (payload as any).warehouse_id
      })
    });
    
    const p = response.data;
    return {
      id: String(p.id),
      product_code: p.product_code,
      sku: p.sku || p.product_code,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      unit_of_measure: p.unit_of_measure,
      cost_price: p.cost_price,
      price: p.selling_price || p.cost_price || 0,
      selling_price: p.selling_price,
      tax_rate: p.tax_rate,
      stock: 0,
      stock_quantity: 0,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      stock_status: 'IN_STOCK',
      product_type: 'SIMPLE',
      currency: 'INR',
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  } catch (error) {
    handleApiError('ecommerce.createProduct', error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  changes: Partial<Product>
): Promise<Product | null> {
  if (!USE_BACKEND_API) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProducts[index] = { ...mockProducts[index], ...changes };
    return mockProducts[index];
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      data: {
        id: number;
        product_code?: string;
        name: string;
        description?: string;
        category?: string;
        subcategory?: string;
        unit_of_measure?: string;
        cost_price?: number;
        selling_price?: number;
        tax_rate?: number;
        hsn_code?: string;
        barcode?: string;
        sku?: string;
        reorder_level?: number;
        reorder_quantity?: number;
        supplier_id?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: changes.name,
        description: changes.description,
        category: changes.category,
        subcategory: changes.subcategory,
        unit_of_measure: (changes as any).unit_of_measure,
        cost_price: changes.cost_price,
        selling_price: changes.selling_price || changes.price,
        tax_rate: (changes as any).tax_rate,
        reorder_level: (changes as any).reorder_level,
        reorder_quantity: (changes as any).reorder_quantity,
        supplier_id: (changes as any).supplier_id,
        is_active: changes.status === 'ACTIVE',
        quantity_on_hand: changes.stock || changes.stock_quantity,
        warehouse_id: (changes as any).warehouse_id
      })
    });
    
    const p = response.data;
    return {
      id: String(p.id),
      product_code: p.product_code,
      sku: p.sku || p.product_code,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      unit_of_measure: p.unit_of_measure,
      cost_price: p.cost_price,
      price: p.selling_price || p.cost_price || 0,
      selling_price: p.selling_price,
      tax_rate: p.tax_rate,
      stock: 0,
      stock_quantity: 0,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      stock_status: 'IN_STOCK',
      product_type: 'SIMPLE',
      currency: 'INR',
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  } catch (error) {
    handleApiError('ecommerce.updateProduct', error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!USE_BACKEND_API) {
    return mockProducts.find(p => p.id === id) || null;
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      data: {
        id: number;
        product_code?: string;
        name: string;
        description?: string;
        category?: string;
        subcategory?: string;
        unit_of_measure?: string;
        cost_price?: number;
        selling_price?: number;
        tax_rate?: number;
        hsn_code?: string;
        barcode?: string;
        sku?: string;
        reorder_level?: number;
        reorder_quantity?: number;
        supplier_id?: number;
        is_active?: boolean;
        quantity_available?: number;
        warehouse_id?: number;
        quantity_on_hand?: number;
        created_at?: string;
        updated_at?: string;
      };
    }>(`/products/${id}`);
    
    const p = response.data;
    return {
      id: String(p.id),
      product_code: p.product_code,
      sku: p.sku || p.product_code,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      unit_of_measure: p.unit_of_measure,
      cost_price: p.cost_price,
      price: p.selling_price || p.cost_price || 0,
      selling_price: p.selling_price,
      tax_rate: p.tax_rate,
      stock: p.quantity_on_hand || p.quantity_available || 0,
      stock_quantity: p.quantity_on_hand || p.quantity_available || 0,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      stock_status: (p.quantity_on_hand || p.quantity_available) && (p.quantity_on_hand || p.quantity_available) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      product_type: 'SIMPLE',
      currency: 'INR',
      supplier_id: p.supplier_id,
      warehouse_id: p.warehouse_id,
      reorder_level: p.reorder_level,
      reorder_quantity: p.reorder_quantity,
      created_at: p.created_at,
      updated_at: p.updated_at
    } as any;
  } catch (error) {
    handleApiError('ecommerce.getProductById', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!USE_BACKEND_API) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) mockProducts.splice(index, 1);
    return;
  }

  try {
    await apiRequest<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    handleApiError('ecommerce.deleteProduct', error);
    throw error;
  }
}

// Get unique unit_of_measure values
export async function listUnitOfMeasures(): Promise<string[]> {
  if (!USE_BACKEND_API) {
    return ['PCS', 'KG', 'L', 'M', 'BOX', 'CARTON'];
  }

  try {
    const response = await apiRequest<{
      success: boolean;
      data: { units: string[] };
    }>('/products/units/list');
    return response.data.units;
  } catch (error) {
    handleApiError('ecommerce.listUnitOfMeasures', error);
    return ['PCS', 'KG', 'L', 'M', 'BOX', 'CARTON'];
  }
}

// Online Order CRUD
export async function listOnlineOrders(): Promise<OnlineOrder[]> {
  // TODO: Implement backend API for online orders
  // For now, return empty array to prevent hanging
  return [];
}

export async function createOnlineOrder(
  payload: Omit<OnlineOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<OnlineOrder> {
  // TODO: Implement backend API for online orders
  const order: OnlineOrder = {
    ...payload,
    id: nextOrderId(),
    created_at: new Date().toISOString()
  };
  mockOrders.unshift(order);
  return order;
}

export async function updateOnlineOrder(
  id: string,
  changes: Partial<OnlineOrder>
): Promise<OnlineOrder | null> {
  // TODO: Implement backend API for online orders
  const index = mockOrders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  mockOrders[index] = { ...mockOrders[index], ...changes };
  return mockOrders[index];
}

export async function deleteOnlineOrder(id: string): Promise<void> {
  // TODO: Implement backend API for online orders
  const index = mockOrders.findIndex((o) => o.id === id);
  if (index !== -1) mockOrders.splice(index, 1);
}

