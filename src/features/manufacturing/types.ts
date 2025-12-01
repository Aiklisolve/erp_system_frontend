import type { BaseEntity } from '../../types/common';

export type ProductionOrderStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProductionOrder extends BaseEntity {
  product: string;
  planned_qty: number;
  status: ProductionOrderStatus;
  start_date: string;
  end_date: string;
}


