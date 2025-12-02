import type { BaseEntity } from '../../types/common';

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  segment: string;
}



