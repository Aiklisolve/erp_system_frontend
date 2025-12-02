import type { BaseEntity } from '../../types/common';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'DRAFT';
export type ProductType = 'SIMPLE' | 'VARIABLE' | 'BUNDLE' | 'DIGITAL' | 'SERVICE';
export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER' | 'ON_DEMAND';
export type TaxStatus = 'TAXABLE' | 'SHIPPING_ONLY' | 'NONE';
export type ShippingClass = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'FREIGHT' | 'DIGITAL' | 'NONE';

export interface Product extends BaseEntity {
  product_code?: string; // Auto-generated product code/SKU
  sku?: string; // Stock Keeping Unit
  name: string;
  slug?: string; // URL-friendly name
  
  // Description
  short_description?: string;
  description?: string; // Full HTML description
  
  // Categorization
  category?: string;
  subcategory?: string;
  tags?: string[];
  brand?: string;
  manufacturer?: string;
  
  // Product Type & Status
  product_type: ProductType;
  status: ProductStatus;
  stock_status: StockStatus;
  
  // Pricing
  price: number;
  compare_at_price?: number; // Original/MSRP price
  cost_price?: number; // Cost of goods
  sale_price?: number; // Discounted price
  currency?: string;
  
  // Inventory
  stock: number;
  stock_quantity?: number; // Alias for stock
  low_stock_threshold?: number;
  manage_stock?: boolean;
  stock_location?: string; // Warehouse location
  
  // Variants & Attributes
  variants?: ProductVariant[];
  attributes?: ProductAttribute[]; // Size, Color, etc.
  
  // Images & Media
  image_url?: string; // Primary image
  gallery_images?: string[]; // Additional images
  video_url?: string;
  
  // Shipping
  weight?: number; // in kg
  length?: number; // in cm
  width?: number; // in cm
  height?: number; // in cm
  shipping_class?: ShippingClass;
  shipping_cost?: number;
  free_shipping?: boolean;
  
  // Tax
  tax_status: TaxStatus;
  tax_class?: string;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  
  // Sales & Marketing
  featured?: boolean;
  on_sale?: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
  
  // Performance Metrics
  total_sales?: number; // Units sold
  total_revenue?: number; // Revenue generated
  average_rating?: number; // 1-5
  review_count?: number;
  view_count?: number;
  
  // Related Products
  related_product_ids?: string[];
  upsell_product_ids?: string[];
  cross_sell_product_ids?: string[];
  
  // Additional
  notes?: string;
  internal_notes?: string;
}

// Product Variant (for variable products)
export interface ProductVariant extends BaseEntity {
  variant_code?: string;
  product_id: string;
  sku?: string;
  name?: string; // e.g., "Small - Red"
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  stock: number;
  weight?: number;
  image_url?: string;
  attributes?: Record<string, string>; // { size: "Small", color: "Red" }
  status?: ProductStatus;
}

// Product Attribute (for filtering/variants)
export interface ProductAttribute {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["Small", "Medium", "Large"]
  type?: 'SELECT' | 'RADIO' | 'CHECKBOX' | 'TEXT';
}

// Online Order
export type OnlineOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'OTHER';

export interface OnlineOrder extends BaseEntity {
  order_number?: string; // Auto-generated order number
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Order Details
  date: string;
  order_date?: string; // Alias for date
  status: OnlineOrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  
  // Items
  items?: OrderItem[];
  
  // Pricing
  subtotal: number;
  tax_amount?: number;
  shipping_cost?: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  
  // Shipping Address
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  
  // Billing Address
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  
  // Shipping & Tracking
  shipping_method?: string;
  tracking_number?: string;
  carrier?: string;
  shipped_date?: string;
  delivered_date?: string;
  expected_delivery_date?: string;
  
  // Additional
  notes?: string;
  internal_notes?: string;
  coupon_code?: string;
}

// Order Item
export interface OrderItem {
  product_id: string;
  product_name?: string;
  product_sku?: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}
