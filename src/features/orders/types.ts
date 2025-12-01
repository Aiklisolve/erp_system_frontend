import type { BaseEntity } from '../../types/common';

export type SalesOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';

export interface SalesOrder extends BaseEntity {
  customer: string;
  date: string;
  status: SalesOrderStatus;
  total_amount: number;
  currency: string;
}


