import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { InventoryItem } from '../types';

let useStatic = !hasSupabaseConfig;

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'SKU-1001',
    name: 'Cloud subscription seat',
    category: 'Software',
    qty_on_hand: 320,
    reorder_level: 150,
    location: 'Main DC',
    created_at: '2025-01-01'
  },
  {
    id: 'inv-2',
    sku: 'SKU-2005',
    name: 'Barcode scanner',
    category: 'Hardware',
    qty_on_hand: 35,
    reorder_level: 40,
    location: 'WH-01-A',
    created_at: '2025-01-03'
  }
];

function nextId() {
  return `inv-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listInventory(): Promise<InventoryItem[]> {
  if (useStatic) return mockInventory;

  try {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) throw error;
    return (data as InventoryItem[]) ?? [];
  } catch (error) {
    handleApiError('inventory.listInventory', error);
    useStatic = true;
    return mockInventory;
  }
}

export async function createInventoryItem(
  payload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItem> {
  if (useStatic) {
    const item: InventoryItem = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockInventory.unshift(item);
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  } catch (error) {
    handleApiError('inventory.createInventoryItem', error);
    useStatic = true;
    return createInventoryItem(payload);
  }
}

export async function updateInventoryItem(
  id: string,
  changes: Partial<InventoryItem>
): Promise<InventoryItem | null> {
  if (useStatic) {
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index === -1) return null;
    mockInventory[index] = { ...mockInventory[index], ...changes };
    return mockInventory[index];
  }

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  } catch (error) {
    handleApiError('inventory.updateInventoryItem', error);
    useStatic = true;
    return updateInventoryItem(id, changes);
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  if (useStatic) {
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index !== -1) mockInventory.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('inventory.deleteInventoryItem', error);
    useStatic = true;
    await deleteInventoryItem(id);
  }
}

// -------------------- VENDORS API --------------------

export interface Vendor {
  id: number;
  vendor_name: string;
  phone_number: string;
  email: string;
  contact_person_name: string;
  address: string;
  materials_products: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VendorPayload {
  vendor_name: string;
  phone_number: string;
  email: string;
  contact_person_name: string;
  address: string;
  materials_products: string;
  is_active?: boolean;
}

interface VendorListResponse {
  success: boolean;
  data: {
    vendors: Vendor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface VendorResponse {
  success: boolean;
  message?: string;
  data: Vendor;
}

// Mock vendors for fallback
const mockVendors: Vendor[] = [
  {
    id: 1,
    vendor_name: 'ABC Electronics Ltd',
    phone_number: '9876543210',
    email: 'contact@abcelectronics.com',
    contact_person_name: 'John Doe',
    address: '123 Industrial Area, City',
    materials_products: 'Electronic components, Circuit boards',
    is_active: true
  }
];

export async function listVendors(): Promise<Vendor[]> {
  try {
    const response = await apiRequest<VendorListResponse>('/inventory/vendors');
    return response.data.vendors;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return mockVendors;
  }
}

export async function getVendorById(id: number): Promise<Vendor | null> {
  try {
    const response = await apiRequest<VendorResponse>(`/inventory/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

export async function createVendor(payload: VendorPayload): Promise<Vendor> {
  try {
    const response = await apiRequest<VendorResponse>('/inventory/vendors', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
}

export async function updateVendor(id: number, payload: Partial<VendorPayload>): Promise<Vendor> {
  try {
    const response = await apiRequest<VendorResponse>(`/inventory/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
}

export async function deleteVendor(id: number): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>(`/inventory/vendors/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
}

// -------------------- CATEGORIES API --------------------

export interface Category {
  id: number;
  category_name: string;
  vendor_id: number;
  vendor_name?: string;
  description?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryPayload {
  category_name: string;
  vendor_id: number;
  description?: string;
}

interface CategoryListResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

// Mock categories for fallback
const mockCategories: Category[] = [
  { id: 1, category_name: 'Electronics', vendor_id: 1, vendor_name: 'ABC Electronics Ltd' },
  { id: 2, category_name: 'Tools', vendor_id: 1, vendor_name: 'ABC Electronics Ltd' },
  { id: 3, category_name: 'Safety Equipment', vendor_id: 1, vendor_name: 'ABC Electronics Ltd' }
];

export async function listCategories(): Promise<Category[]> {
  try {
    const response = await apiRequest<CategoryListResponse>('/inventory/categories');
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return mockCategories;
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const response = await apiRequest<CategoryResponse>(`/inventory/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  try {
    const response = await apiRequest<CategoryResponse>('/inventory/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>): Promise<Category> {
  try {
    const response = await apiRequest<CategoryResponse>(`/inventory/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>(`/inventory/categories/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// -------------------- INVENTORY ASSIGNMENTS API --------------------

export interface InventoryAssignment {
  id: number;
  product_id: number;
  product_name?: string;
  product_code?: string;
  purchase_order_id: number;
  po_number?: string;
  quantity: number;
  date_of_use: string;
  reason_notes: string;
  created_by?: string;
  created_at?: string;
}

export interface AssignmentPayload {
  product_id: number;
  purchase_order_id: number;
  quantity: number;
  date_of_use: string;
  reason_notes: string;
}

interface AssignmentListResponse {
  success: boolean;
  data: {
    assignments: InventoryAssignment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface AssignmentResponse {
  success: boolean;
  message?: string;
  data: InventoryAssignment;
}

export async function listAssignments(): Promise<InventoryAssignment[]> {
  try {
    const response = await apiRequest<AssignmentListResponse>('/inventory/assignments');
    return response.data.assignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

export async function createAssignment(payload: AssignmentPayload): Promise<InventoryAssignment> {
  try {
    const response = await apiRequest<AssignmentResponse>('/inventory/assignments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

// -------------------- PURCHASE ORDERS API (for assignment form) --------------------

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_name: string;
  order_date: string;
  status: string;
  total_amount?: number;
}

interface PurchaseOrderListResponse {
  success: boolean;
  data: {
    purchase_orders: PurchaseOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Mock purchase orders for fallback
const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 1, po_number: 'PO-001', supplier_name: 'ABC Supplies', order_date: '2025-01-01', status: 'APPROVED' },
  { id: 2, po_number: 'PO-002', supplier_name: 'XYZ Parts', order_date: '2025-01-05', status: 'PENDING' },
  { id: 3, po_number: 'PO-003', supplier_name: 'Global Materials', order_date: '2025-01-10', status: 'APPROVED' }
];

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const response = await apiRequest<PurchaseOrderListResponse>('/inventory/purchase-orders');
    return response.data.purchase_orders;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return mockPurchaseOrders;
  }
}

// -------------------- PRODUCTS API (for assignment form) --------------------

export interface Product {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  category?: string;
  unit_of_measure?: string;
  is_active?: boolean;
}

interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Mock products for fallback
const mockProductsList: Product[] = [
  { id: 1, product_code: 'PN-001', name: 'Engine Oil Filter' },
  { id: 2, product_code: 'PN-002', name: 'Brake Pads' },
  { id: 3, product_code: 'PN-003', name: 'Air Filter' }
];

export async function listProducts(): Promise<Product[]> {
  try {
    const response = await apiRequest<ProductListResponse>('/inventory/products');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return mockProductsList;
  }
}


