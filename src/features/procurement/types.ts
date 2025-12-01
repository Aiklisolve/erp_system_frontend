import type { BaseEntity } from '../../types/common';

export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'RECEIVED';

export interface PurchaseOrder extends BaseEntity {
  supplier: string;
  date: string;
  status: PurchaseOrderStatus;
  total_amount: number;
}


