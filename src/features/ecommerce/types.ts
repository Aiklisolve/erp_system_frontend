import type { BaseEntity } from '../../types/common';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product extends BaseEntity {
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
}

export type OnlineOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OnlineOrder extends BaseEntity {
  customer_name: string;
  date: string;
  total_amount: number;
  status: OnlineOrderStatus;
}

