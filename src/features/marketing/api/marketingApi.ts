import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Campaign, MarketingAsset, Lead } from '../types';

let useStatic = !hasSupabaseConfig;

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    campaign_code: 'CAMP-2025-Q1PL001',
    name: 'Q1 Product Launch',
    description: 'Launch campaign for new ERP product features',
    campaign_type: 'BRAND_AWARENESS',
    channel: 'EMAIL',
    sub_channel: 'Mailchimp',
    status: 'ACTIVE',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    launch_date: '2025-01-01',
    budget: 5000,
    budget_type: 'LIFETIME',
    spent: 2850,
    remaining_budget: 2150,
    currency: 'USD',
    target_audience: 'B2B decision makers, IT managers',
    target_demographics: 'Age 30-55, Male/Female, Tech industry',
    target_locations: ['United States', 'Canada', 'United Kingdom'],
    bidding_strategy: 'CPC',
    cost_per_click: 0.85,
    impressions: 125000,
    clicks: 3500,
    click_through_rate: 2.8,
    unique_clicks: 3200,
    reach: 98000,
    leads: 245,
    conversions: 45,
    conversion_rate: 1.29,
    conversion_type: 'SIGNUP',
    revenue: 13450,
    cost_per_lead: 11.63,
    cost_per_conversion: 63.33,
    return_on_investment: 371.93,
    return_on_ad_spend: 4.72,
    profit: 10600,
    campaign_url: 'https://erp.example.com/q1-launch',
    ad_copy: 'Discover the new ERP features that will transform your business operations.',
    call_to_action: 'Start Free Trial',
    campaign_manager: 'Sarah Johnson',
    assigned_to: 'Marketing Team',
    team: 'Digital Marketing',
    tracking_code: 'utm_source=email&utm_campaign=q1-launch',
    analytics_id: 'GA-123456789',
    target_impressions: 150000,
    target_clicks: 4000,
    target_leads: 300,
    target_revenue: 15000,
    target_roi: 200,
    is_ab_test: false,
    notes: 'Strong performance in first month',
    created_at: '2024-12-15'
  },
  {
    id: 'camp-2',
    campaign_code: 'CAMP-2025-SMA002',
    name: 'Social Media Awareness',
    description: 'Brand awareness campaign on social platforms',
    campaign_type: 'BRAND_AWARENESS',
    channel: 'SOCIAL_MEDIA',
    sub_channel: 'Facebook, LinkedIn',
    status: 'ACTIVE',
    start_date: '2025-01-10',
    end_date: '2025-02-28',
    launch_date: '2025-01-10',
    budget: 3000,
    budget_type: 'DAILY',
    daily_budget: 150,
    spent: 1200,
    remaining_budget: 1800,
    currency: 'USD',
    target_audience: 'Business professionals, entrepreneurs',
    target_interests: ['Business Software', 'ERP', 'Technology'],
    bidding_strategy: 'CPM',
    cost_per_mille: 12.50,
    impressions: 89000,
    clicks: 2100,
    click_through_rate: 2.36,
    reach: 75000,
    leads: 128,
    conversions: 18,
    conversion_rate: 0.86,
    conversion_type: 'FORM_SUBMIT',
    revenue: 5400,
    cost_per_lead: 9.38,
    likes: 450,
    shares: 120,
    comments: 85,
    return_on_investment: 350,
    return_on_ad_spend: 4.5,
    profit: 4200,
    campaign_url: 'https://erp.example.com/social',
    call_to_action: 'Learn More',
    campaign_manager: 'Mike Wilson',
    assigned_to: 'Social Media Team',
    team: 'Digital Marketing',
    tracking_code: 'utm_source=social&utm_campaign=awareness',
    pixel_id: 'FB-987654321',
    target_impressions: 100000,
    target_clicks: 2500,
    target_leads: 150,
    is_ab_test: true,
    ab_test_variant: 'Variant A',
    notes: 'Testing different ad creatives',
    created_at: '2024-12-20'
  },
  {
    id: 'camp-3',
    campaign_code: 'CAMP-2024-PPC003',
    name: 'PPC Lead Generation',
    description: 'Google Ads campaign for lead generation',
    campaign_type: 'LEAD_GENERATION',
    channel: 'PPC',
    sub_channel: 'Google Ads',
    status: 'COMPLETED',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    launch_date: '2024-12-01',
    budget: 8000,
    budget_type: 'LIFETIME',
    spent: 7850,
    remaining_budget: 150,
    currency: 'USD',
    target_audience: 'B2B buyers searching for ERP solutions',
    target_keywords: ['ERP software', 'business management software', 'enterprise resource planning'],
    bidding_strategy: 'CPA',
    cost_per_acquisition: 8.82,
    target_cpa: 10.00,
    impressions: 450000,
    clicks: 12000,
    click_through_rate: 2.67,
    unique_clicks: 11000,
    reach: 380000,
    leads: 890,
    conversions: 156,
    conversion_rate: 1.30,
    conversion_type: 'PURCHASE',
    revenue: 46800,
    cost_per_lead: 8.82,
    cost_per_conversion: 50.32,
    return_on_investment: 496.18,
    return_on_ad_spend: 5.96,
    profit: 38950,
    campaign_url: 'https://erp.example.com/ppc-landing',
    ad_copy: 'Find the perfect ERP solution for your business. Start your free trial today!',
    call_to_action: 'Get Started',
    campaign_manager: 'Lisa Anderson',
    assigned_to: 'PPC Team',
    team: 'Digital Marketing',
    tracking_code: 'utm_source=google&utm_campaign=ppc-leads',
    analytics_id: 'GA-123456789',
    target_impressions: 400000,
    target_clicks: 10000,
    target_leads: 800,
    target_revenue: 40000,
    target_roi: 400,
    is_ab_test: false,
    notes: 'Exceeded all targets, highly successful campaign',
    created_at: '2024-11-25'
  }
];

function nextId() {
  return `camp-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (useStatic) return mockCampaigns;

  try {
    const { data, error } = await supabase.from('marketing_campaigns').select('*');
    if (error) throw error;
    return (data as Campaign[]) ?? [];
  } catch (error) {
    handleApiError('marketing.listCampaigns', error);
    useStatic = true;
    return mockCampaigns;
  }
}

export async function createCampaign(
  payload: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
): Promise<Campaign> {
  if (useStatic) {
    const campaign: Campaign = {
      ...payload,
      impressions: payload.impressions ?? 0,
      clicks: payload.clicks ?? 0,
      leads: payload.leads ?? 0,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockCampaigns.unshift(campaign);
    return campaign;
  }

  try {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Campaign;
  } catch (error) {
    handleApiError('marketing.createCampaign', error);
    useStatic = true;
    return createCampaign(payload);
  }
}

export async function updateCampaign(
  id: string,
  changes: Partial<Campaign>
): Promise<Campaign | null> {
  if (useStatic) {
    const index = mockCampaigns.findIndex((c) => c.id === id);
    if (index === -1) return null;
    mockCampaigns[index] = { ...mockCampaigns[index], ...changes };
    return mockCampaigns[index];
  }

  try {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Campaign;
  } catch (error) {
    handleApiError('marketing.updateCampaign', error);
    useStatic = true;
    return updateCampaign(id, changes);
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  if (useStatic) {
    const index = mockCampaigns.findIndex((c) => c.id === id);
    if (index !== -1) mockCampaigns.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('marketing.deleteCampaign', error);
    useStatic = true;
    await deleteCampaign(id);
  }
}

// ============================================
// MARKETING ASSETS API
// ============================================

const mockAssets: MarketingAsset[] = [
  {
    id: 'asset-1',
    asset_code: 'ASSET-2025-000001',
    name: 'Q1 Launch Banner',
    type: 'IMAGE',
    url: 'https://example.com/assets/banner.jpg',
    file_size: 245760,
    campaign_id: 'camp-1',
    tags: ['banner', 'launch', 'q1'],
    created_at: '2025-01-01T10:00:00.000Z',
    updated_at: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 'asset-2',
    asset_code: 'ASSET-2025-000002',
    name: 'Product Demo Video',
    type: 'VIDEO',
    url: 'https://example.com/assets/demo.mp4',
    file_size: 5242880,
    campaign_id: 'camp-1',
    tags: ['video', 'demo', 'product'],
    created_at: '2025-01-02T10:00:00.000Z',
    updated_at: '2025-01-02T10:00:00.000Z'
  }
];

function nextAssetId() {
  return `asset-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAssets(campaignId?: string): Promise<MarketingAsset[]> {
  if (useStatic) {
    let assets = mockAssets;
    if (campaignId) {
      assets = assets.filter((a) => a.campaign_id === campaignId);
    }
    return assets;
  }

  try {
    let query = supabase.from('marketing_assets').select('*');
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as MarketingAsset[]) ?? [];
  } catch (error) {
    handleApiError('marketing.listAssets', error);
    useStatic = true;
    return campaignId ? mockAssets.filter((a) => a.campaign_id === campaignId) : mockAssets;
  }
}

export async function createAsset(
  payload: Omit<MarketingAsset, 'id' | 'created_at' | 'updated_at'>
): Promise<MarketingAsset> {
  if (useStatic) {
    const asset: MarketingAsset = {
      ...payload,
      id: nextAssetId(),
      created_at: new Date().toISOString()
    };
    mockAssets.unshift(asset);
    return asset;
  }

  try {
    const { data, error } = await supabase
      .from('marketing_assets')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as MarketingAsset;
  } catch (error) {
    handleApiError('marketing.createAsset', error);
    useStatic = true;
    return createAsset(payload);
  }
}

export async function updateAsset(
  id: string,
  changes: Partial<MarketingAsset>
): Promise<MarketingAsset | null> {
  if (useStatic) {
    const index = mockAssets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    mockAssets[index] = { ...mockAssets[index], ...changes };
    return mockAssets[index];
  }

  try {
    const { data, error } = await supabase
      .from('marketing_assets')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MarketingAsset;
  } catch (error) {
    handleApiError('marketing.updateAsset', error);
    useStatic = true;
    return updateAsset(id, changes);
  }
}

export async function deleteAsset(id: string): Promise<void> {
  if (useStatic) {
    const index = mockAssets.findIndex((a) => a.id === id);
    if (index !== -1) mockAssets.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('marketing_assets').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('marketing.deleteAsset', error);
    useStatic = true;
    await deleteAsset(id);
  }
}

// ============================================
// MARKETING LEADS API
// ============================================

const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    lead_code: 'LEAD-2025-000001',
    campaign_id: 'camp-1',
    campaign_name: 'Q1 Product Launch',
    source: 'Website Form',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    company: 'Acme Corp',
    job_title: 'CTO',
    status: 'NEW',
    score: 75,
    notes: 'Interested in enterprise features',
    created_at: '2025-01-05T10:00:00.000Z',
    updated_at: '2025-01-05T10:00:00.000Z'
  },
  {
    id: 'lead-2',
    lead_code: 'LEAD-2025-000002',
    campaign_id: 'camp-1',
    campaign_name: 'Q1 Product Launch',
    source: 'Social Media',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0102',
    company: 'Tech Solutions Inc',
    job_title: 'Marketing Manager',
    status: 'CONTACTED',
    score: 60,
    notes: 'Follow up scheduled',
    created_at: '2025-01-06T10:00:00.000Z',
    updated_at: '2025-01-07T10:00:00.000Z'
  }
];

function nextLeadId() {
  return `lead-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listLeads(campaignId?: string): Promise<Lead[]> {
  if (useStatic) {
    let leads = mockLeads;
    if (campaignId) {
      leads = leads.filter((l) => l.campaign_id === campaignId);
    }
    return leads;
  }

  try {
    let query = supabase.from('marketing_leads').select('*');
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Lead[]) ?? [];
  } catch (error) {
    handleApiError('marketing.listLeads', error);
    useStatic = true;
    return campaignId ? mockLeads.filter((l) => l.campaign_id === campaignId) : mockLeads;
  }
}

export async function createLead(
  payload: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
): Promise<Lead> {
  if (useStatic) {
    const lead: Lead = {
      ...payload,
      id: nextLeadId(),
      status: payload.status || 'NEW',
      score: payload.score ?? 0,
      created_at: new Date().toISOString()
    };
    mockLeads.unshift(lead);
    return lead;
  }

  try {
    const { data, error } = await supabase
      .from('marketing_leads')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Lead;
  } catch (error) {
    handleApiError('marketing.createLead', error);
    useStatic = true;
    return createLead(payload);
  }
}

export async function updateLead(
  id: string,
  changes: Partial<Lead>
): Promise<Lead | null> {
  if (useStatic) {
    const index = mockLeads.findIndex((l) => l.id === id);
    if (index === -1) return null;
    mockLeads[index] = { ...mockLeads[index], ...changes };
    return mockLeads[index];
  }

  try {
    const { data, error } = await supabase
      .from('marketing_leads')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Lead;
  } catch (error) {
    handleApiError('marketing.updateLead', error);
    useStatic = true;
    return updateLead(id, changes);
  }
}

export async function deleteLead(id: string): Promise<void> {
  if (useStatic) {
    const index = mockLeads.findIndex((l) => l.id === id);
    if (index !== -1) mockLeads.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('marketing_leads').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('marketing.deleteLead', error);
    useStatic = true;
    await deleteLead(id);
  }
}

