import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Campaign } from '../types';

let useStatic = !hasSupabaseConfig;

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q1 Product Launch',
    channel: 'EMAIL',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    status: 'ACTIVE',
    budget: 5000,
    impressions: 125000,
    clicks: 3500,
    leads: 245,
    created_at: '2024-12-15'
  },
  {
    id: 'camp-2',
    name: 'Social Media Awareness',
    channel: 'SOCIAL_MEDIA',
    start_date: '2025-01-10',
    end_date: '2025-02-28',
    status: 'ACTIVE',
    budget: 3000,
    impressions: 89000,
    clicks: 2100,
    leads: 128,
    created_at: '2024-12-20'
  },
  {
    id: 'camp-3',
    name: 'PPC Lead Generation',
    channel: 'PPC',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    status: 'COMPLETED',
    budget: 8000,
    impressions: 450000,
    clicks: 12000,
    leads: 890,
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

