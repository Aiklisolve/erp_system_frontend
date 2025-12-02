import type { BaseEntity } from '../../types/common';

export interface Shift extends BaseEntity {
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
}



