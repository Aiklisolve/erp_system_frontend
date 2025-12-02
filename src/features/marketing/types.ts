import type { BaseEntity } from '../../types/common';

export type CampaignChannel = 'EMAIL' | 'SOCIAL_MEDIA' | 'SEO' | 'PPC' | 'CONTENT' | 'AFFILIATE' | 'DISPLAY' | 'VIDEO' | 'MOBILE' | 'RADIO' | 'TV' | 'PRINT' | 'EVENTS' | 'OTHER';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type CampaignType = 'BRAND_AWARENESS' | 'LEAD_GENERATION' | 'SALES' | 'RETENTION' | 'REENGAGEMENT' | 'EDUCATION' | 'OTHER';
export type BudgetType = 'DAILY' | 'LIFETIME' | 'CUSTOM';
export type BiddingStrategy = 'CPC' | 'CPM' | 'CPA' | 'CPV' | 'AUTOMATIC' | 'MANUAL';
export type ConversionType = 'PURCHASE' | 'SIGNUP' | 'DOWNLOAD' | 'FORM_SUBMIT' | 'CALL' | 'VISIT' | 'OTHER';

export interface Campaign extends BaseEntity {
  campaign_code?: string; // Auto-generated campaign code
  name: string;
  description?: string;
  
  // Campaign Type & Channel
  campaign_type?: CampaignType;
  channel: CampaignChannel;
  sub_channel?: string; // e.g., "Facebook", "Google Ads", "LinkedIn"
  
  // Status & Dates
  status: CampaignStatus;
  start_date: string;
  end_date?: string;
  launch_date?: string; // Actual launch date
  
  // Budget
  budget: number;
  budget_type: BudgetType;
  daily_budget?: number; // For daily budget type
  spent?: number; // Amount spent so far
  remaining_budget?: number; // Auto-calculated
  currency?: string;
  
  // Targeting
  target_audience?: string; // Audience description
  target_demographics?: string; // Age, gender, location
  target_locations?: string[]; // Geographic targeting
  target_interests?: string[]; // Interest-based targeting
  target_keywords?: string[]; // For SEO/PPC campaigns
  
  // Bidding & Optimization
  bidding_strategy?: BiddingStrategy;
  cost_per_click?: number; // CPC
  cost_per_mille?: number; // CPM
  cost_per_acquisition?: number; // CPA
  target_cpa?: number; // Target cost per acquisition
  
  // Performance Metrics - Impressions & Engagement
  impressions?: number;
  clicks?: number;
  click_through_rate?: number; // CTR - Auto-calculated
  unique_clicks?: number;
  reach?: number; // Unique users reached
  
  // Performance Metrics - Conversions
  leads?: number;
  conversions?: number;
  conversion_rate?: number; // Auto-calculated
  conversion_type?: ConversionType;
  revenue?: number; // Revenue generated
  cost_per_lead?: number; // CPL - Auto-calculated
  cost_per_conversion?: number; // Auto-calculated
  
  // Performance Metrics - Engagement
  likes?: number;
  shares?: number;
  comments?: number;
  saves?: number;
  video_views?: number;
  video_completion_rate?: number;
  email_opens?: number;
  email_clicks?: number;
  email_bounce_rate?: number;
  
  // ROI & Performance
  return_on_investment?: number; // ROI % - Auto-calculated
  return_on_ad_spend?: number; // ROAS - Auto-calculated
  profit?: number; // Revenue - Cost
  
  // Campaign Details
  campaign_url?: string; // Landing page URL
  creative_assets?: string[]; // URLs to creative assets
  ad_copy?: string; // Ad text/content
  call_to_action?: string; // CTA text
  
  // Assignment & Ownership
  campaign_manager?: string;
  assigned_to?: string;
  team?: string;
  
  // Tracking & Analytics
  tracking_code?: string; // UTM or tracking code
  analytics_id?: string; // Google Analytics ID, etc.
  pixel_id?: string; // Facebook Pixel, etc.
  
  // Goals & KPIs
  target_impressions?: number;
  target_clicks?: number;
  target_leads?: number;
  target_conversions?: number;
  target_revenue?: number;
  target_roi?: number;
  
  // A/B Testing
  is_ab_test?: boolean;
  ab_test_variant?: string; // Variant A, B, C, etc.
  ab_test_winner?: string;
  
  // Additional
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}

// Lead (for marketing context)
export interface Lead extends BaseEntity {
  lead_code?: string;
  campaign_id?: string;
  campaign_name?: string;
  source?: string; // Where lead came from
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  score?: number; // Lead score
  notes?: string;
}

// Marketing Asset
export interface MarketingAsset extends BaseEntity {
  asset_code?: string;
  name: string;
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER';
  url?: string;
  file_size?: number;
  campaign_id?: string;
  tags?: string[];
}
