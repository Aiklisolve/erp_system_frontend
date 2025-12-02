import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Product, OnlineOrder } from '../types';

let useStatic = !hasSupabaseConfig;

// Mock Products
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium ERP License',
    price: 299.99,
    stock: 150,
    status: 'ACTIVE',
    created_at: '2025-01-01'
  },
  {
    id: 'prod-2',
    name: 'Basic ERP Subscription',
    price: 99.99,
    stock: 0,
    status: 'OUT_OF_STOCK',
    created_at: '2025-01-02'
  },
  {
    id: 'prod-3',
    name: 'Enterprise Support Package',
    price: 499.99,
    stock: 25,
    status: 'ACTIVE',
    created_at: '2025-01-03'
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

