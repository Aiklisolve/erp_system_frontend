import type { BaseEntity } from '../../types/common';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project extends BaseEntity {
  name: string;
  client: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  budget: number;
}

