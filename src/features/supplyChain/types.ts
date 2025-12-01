import type { BaseEntity } from '../../types/common';

export interface Supplier extends BaseEntity {
  name: string;
  contact_person: string;
  phone: string;
  rating: number; // 1–5
}


