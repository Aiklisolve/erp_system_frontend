import type { BaseEntity } from '../../types/common';

export interface InventoryItem extends BaseEntity {
  sku: string;
  name: string;
  category: string;
  qty_on_hand: number;
  reorder_level: number;
  location: string;
}


