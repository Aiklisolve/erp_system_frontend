import { apiRequest } from '../../../config/api';
import type { InventoryItem } from '../types';

// Mock inventory for fallback
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

interface InventoryListResponse {
  success: boolean;
  data: {
    products: Array<{
      id: number;
      product_code: string;
      name: string;
      description?: string;
      category?: string;
      unit_of_measure?: string;
      is_active?: boolean;
      qty_on_hand?: number;
      qty_available?: number;
      qty_reserved?: number;
      created_at?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function listInventory(): Promise<InventoryItem[]> {
  try {
    const response = await apiRequest<InventoryListResponse>('/inventory/products?limit=1000');
    
    // Transform backend data to InventoryItem format
    return response.data.products.map(p => ({
      id: String(p.id),
      sku: p.product_code || '',
      name: p.name || '',
      category: p.category || 'Other',
      qty_on_hand: p.qty_on_hand || 0,
      reorder_level: 10, // Default reorder level
      location: p.description || 'Main Warehouse',
      created_at: p.created_at
    }));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return mockInventory;
  }
}

export async function createInventoryItem(
  payload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItem> {
  try {
    const response = await apiRequest<{ success: boolean; data: any }>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.location,
        category: payload.category,
        unit_of_measure: 'PCS',
        qty_on_hand: payload.qty_on_hand,
        warehouse_id: 1
      })
    });
    
    const p = response.data;
    return {
      id: String(p.id),
      sku: p.product_code || '',
      name: p.name || '',
      category: p.category || 'Other',
      qty_on_hand: payload.qty_on_hand,
      reorder_level: payload.reorder_level,
      location: payload.location,
      created_at: p.created_at
    };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(
  id: string,
  changes: Partial<InventoryItem>
): Promise<InventoryItem | null> {
  try {
    const response = await apiRequest<{ success: boolean; data: any }>(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: changes.name,
        description: changes.location,
        category: changes.category,
        unit_of_measure: 'PCS',
        qty_on_hand: changes.qty_on_hand,
        warehouse_id: 1
      })
    });
    
    const p = response.data;
    return {
      id: String(p.id),
      sku: p.product_code || '',
      name: p.name || '',
      category: p.category || 'Other',
      qty_on_hand: changes.qty_on_hand || 0,
      reorder_level: changes.reorder_level || 10,
      location: p.description || 'Main Warehouse',
      created_at: p.created_at
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>(`/inventory/products/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
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
  console.log('🔄 Fetching vendors from backend API...');
  try {
    const response = await apiRequest<VendorListResponse>('/inventory/vendors');
    console.log('🏢 Backend vendors response:', response);
    console.log('🏢 Response structure:', {
      hasData: !!response.data,
      hasVendors: !!response.data?.vendors,
      vendorsCount: response.data?.vendors?.length || 0
    });
    const vendors = response.data.vendors || [];
    console.log('✅ Returning vendors:', vendors.length);
    return vendors;
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    console.log('⚠️ Falling back to mock vendors');
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

export async function updateAssignment(id: number, payload: { quantity: number; date_of_use?: string; reason_notes?: string }): Promise<InventoryAssignment> {
  try {
    const response = await apiRequest<AssignmentResponse>(`/inventory/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return response.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
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

// -------------------- INVENTORY ITEM CRUD (Products with Stock) --------------------

export interface InventoryItemPayload {
  name: string;
  description?: string;
  category: string;
  unit_of_measure?: string;
  qty_on_hand: number;
  reorder_level?: number;
  location?: string;
  warehouse_id?: number;
}

interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export async function createInventoryProduct(payload: InventoryItemPayload): Promise<Product> {
  try {
    const response = await apiRequest<ProductResponse>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description || payload.location,
        category: payload.category,
        unit_of_measure: payload.unit_of_measure || 'PCS',
        qty_on_hand: payload.qty_on_hand,
        warehouse_id: payload.warehouse_id || 1
      })
    });
    return response.data;
  } catch (error) {
    console.error('Error creating inventory product:', error);
    throw error;
  }
}

export async function updateInventoryProduct(id: number, payload: Partial<InventoryItemPayload>): Promise<Product> {
  try {
    const response = await apiRequest<ProductResponse>(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description || payload.location,
        category: payload.category,
        unit_of_measure: payload.unit_of_measure
      })
    });
    return response.data;
  } catch (error) {
    console.error('Error updating inventory product:', error);
    throw error;
  }
}

export async function deleteInventoryProduct(id: number): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>(`/inventory/products/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting inventory product:', error);
    throw error;
  }
}


