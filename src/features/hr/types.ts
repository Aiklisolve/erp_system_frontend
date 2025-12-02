import type { BaseEntity } from '../../types/common';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface Employee extends BaseEntity {
  name: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  join_date: string;
}



