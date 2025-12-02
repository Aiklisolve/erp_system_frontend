import type { BaseEntity } from '../../types/common';

export type CampaignChannel = 'EMAIL' | 'SOCIAL_MEDIA' | 'SEO' | 'PPC' | 'CONTENT' | 'AFFILIATE';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Campaign extends BaseEntity {
  name: string;
  channel: CampaignChannel;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  budget: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
}

