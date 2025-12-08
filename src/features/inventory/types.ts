import type { BaseEntity } from '../../types/common';

export interface InventoryItem extends BaseEntity {
  sku: string;
  name: string;
  category: string;
  qty_on_hand: number;
  reorder_level: number;
  location: string;
}

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

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_name: string;
  order_date: string;
  status: string;
  total_amount?: number;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  category?: string;
  unit_of_measure?: string;
  is_active?: boolean;
}


