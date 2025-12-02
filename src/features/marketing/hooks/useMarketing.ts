import { useEffect, useState } from 'react';
import type { Campaign } from '../types';
import * as api from '../api/marketingApi';

export function useMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  const create = async (payload: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await api.createCampaign(payload);
    setCampaigns((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Campaign>) => {
    const updated = await api.updateCampaign(id, changes);
    if (!updated) return;
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const remove = async (id: string) => {
    await api.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  // Metrics
  const metrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + (c.impressions ?? 0), 0),
    totalClicks: campaigns.reduce((sum, c) => sum + (c.clicks ?? 0), 0),
    totalLeads: campaigns.reduce((sum, c) => sum + (c.leads ?? 0), 0),
    averageCTR: campaigns.length > 0
      ? campaigns.reduce((sum, c) => {
          const ctr = c.impressions && c.impressions > 0 ? (c.clicks ?? 0) / c.impressions : 0;
          return sum + ctr;
        }, 0) / campaigns.length * 100
      : 0
  };

  return {
    campaigns,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}

