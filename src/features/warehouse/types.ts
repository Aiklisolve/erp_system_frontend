import type { BaseEntity } from '../../types/common';

export interface StockMovement extends BaseEntity {
  item_id: string;
  from_location: string;
  to_location: string;
  quantity: number;
  movement_date: string;
}


