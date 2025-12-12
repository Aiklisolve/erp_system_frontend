import { useState, useEffect } from 'react';
import { useMarketing } from '../hooks/useMarketing';
import { useToast } from '../../../hooks/useToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Campaign, MarketingAsset, Lead } from '../types';
import { CampaignForm } from './CampaignForm';
import { AssetForm } from './AssetForm';
import { LeadForm } from './LeadForm';
import * as marketingApi from '../api/marketingApi';

export function CampaignList() {
  const { campaigns, loading, create, update, remove, refresh, metrics } = useMarketing();
  const { showToast } = useToast();
  
  // Main tab: 'campaigns', 'assets', or 'leads'
  const [mainTab, setMainTab] = useState<'campaigns' | 'assets' | 'leads'>('campaigns');
  
  // Campaign status filter tab (within campaigns tab)
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'paused' | 'completed' | 'draft' | 'scheduled' | 'archived' | 'cancelled'>('all');
  
  // Campaign states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Assets states
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MarketingAsset | null>(null);
  const [assetDeleteConfirmOpen, setAssetDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<MarketingAsset | null>(null);
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [assetCampaignFilter, setAssetCampaignFilter] = useState<string>('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [assetsCurrentPage, setAssetsCurrentPage] = useState(1);

  // Leads states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadDeleteConfirmOpen, setLeadDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [leadCampaignFilter, setLeadCampaignFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadsCurrentPage, setLeadsCurrentPage] = useState(1);

  // Load assets when assets tab is active
  useEffect(() => {
    if (mainTab === 'assets') {
      loadAssets();
    }
  }, [mainTab]);

  // Load leads when leads tab is active
  useEffect(() => {
    if (mainTab === 'leads') {
      loadLeads();
    }
  }, [mainTab]);

  const loadAssets = async () => {
    setAssetsLoading(true);
    try {
      const data = await marketingApi.listAssets();
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
      showToast('error', 'Load Failed', 'Failed to load assets. Please try again.');
    } finally {
      setAssetsLoading(false);
    }
  };

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const data = await marketingApi.listLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
      showToast('error', 'Load Failed', 'Failed to load leads. Please try again.');
    } finally {
      setLeadsLoading(false);
    }
  };

  // Filter campaigns based on search, status, channel, and status tab
  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (campaign.name || '').toLowerCase().includes(searchLower) ||
      (campaign.campaign_code && campaign.campaign_code.toLowerCase().includes(searchLower)) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchLower)) ||
      (campaign.sub_channel && campaign.sub_channel.toLowerCase().includes(searchLower)) ||
      (campaign.campaign_manager && campaign.campaign_manager.toLowerCase().includes(searchLower)) ||
      (campaign.channel || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || campaign.channel === channelFilter;
    
    const matchesStatusTab =
      statusTab === 'all' ||
      (statusTab === 'active' && campaign.status === 'ACTIVE') ||
      (statusTab === 'paused' && campaign.status === 'PAUSED') ||
      (statusTab === 'completed' && campaign.status === 'COMPLETED') ||
      (statusTab === 'draft' && campaign.status === 'DRAFT') ||
      (statusTab === 'scheduled' && campaign.status === 'SCHEDULED') ||
      (statusTab === 'archived' && campaign.status === 'ARCHIVED') ||
      (statusTab === 'cancelled' && campaign.status === 'CANCELLED');
    
    return matchesSearch && matchesStatus && matchesChannel && matchesStatusTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(campaigns.map((c) => c.status)));

  // Calculate status counts for tabs
  const statusCounts = campaigns.reduce(
    (acc, c) => {
      if (c.status === 'ACTIVE') acc.active += 1;
      if (c.status === 'PAUSED') acc.paused += 1;
      if (c.status === 'COMPLETED') acc.completed += 1;
      if (c.status === 'DRAFT') acc.draft += 1;
      if (c.status === 'SCHEDULED') acc.scheduled += 1;
      if (c.status === 'ARCHIVED') acc.archived += 1;
      if (c.status === 'CANCELLED') acc.cancelled += 1;
      return acc;
    },
    { active: 0, paused: 0, completed: 0, draft: 0, scheduled: 0, archived: 0, cancelled: 0 }
  );

  // Calculate metrics
  const metricsByStatus = campaigns.reduce(
    (acc, c) => {
      if (c.status === 'ACTIVE') acc.active += 1;
      if (c.status === 'PAUSED') acc.paused += 1;
      if (c.status === 'COMPLETED') acc.completed += 1;
      if (c.return_on_investment && c.return_on_investment > 0) acc.positiveRoi += 1;
      return acc;
    },
    { active: 0, paused: 0, completed: 0, positiveRoi: 0 }
  );

  const columns: TableColumn<Campaign>[] = [
    {
      key: 'campaign_code',
      header: 'Code',
      render: (row) => row.campaign_code || row.id,
    },
    {
      key: 'name',
      header: 'Campaign',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.description && (
            <div className="text-[10px] text-slate-500 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (row) => (
        <div className="space-y-0.5">
          <Badge tone="neutral" variant="outline">
            {row.channel.replace('_', ' ')}
          </Badge>
          {row.sub_channel && (
            <div className="text-[10px] text-slate-500">{row.sub_channel}</div>
          )}
        </div>
      ),
    },
    {
      key: 'campaign_type',
      header: 'Type',
      render: (row) => {
        if (!row.campaign_type) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <span className="text-[11px] text-slate-600">
            {row.campaign_type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'ACTIVE'
            ? 'success'
            : row.status === 'PAUSED'
            ? 'warning'
            : row.status === 'COMPLETED'
            ? 'brand'
            : row.status === 'CANCELLED'
            ? 'danger'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) => {
        const spent = row.spent || 0;
        const budget = row.budget || 0;
        const spentPercent = budget > 0 ? (spent / budget) * 100 : 0;
        return (
          <div className="space-y-0.5">
            <div className="text-slate-900">
              {budget.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'INR' })}
            </div>
            {spent > 0 && (
              <div className="text-[10px] text-slate-500">
                Spent: {spent.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'INR' })} ({spentPercent.toFixed(0)}%)
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'impressions',
      header: 'Performance',
      render: (row) => {
        const ctr = row.impressions && row.impressions > 0 && row.clicks
          ? ((row.clicks / row.impressions) * 100).toFixed(2)
          : row.click_through_rate?.toFixed(2) || '0.00';
        const convRate = row.clicks && row.clicks > 0 && row.conversions
          ? ((row.conversions / row.clicks) * 100).toFixed(2)
          : row.conversion_rate?.toFixed(2) || '0.00';
        return (
          <div className="space-y-0.5 text-[11px]">
            <div className="text-slate-900">
              Impr: {row.impressions?.toLocaleString() ?? 0}
            </div>
            <div className="text-slate-600">
              Clicks: {row.clicks?.toLocaleString() ?? 0}
            </div>
            <div className="font-medium text-slate-900">
              CTR: {ctr}% | Conv: {convRate}%
            </div>
          </div>
        );
      },
    },
    {
      key: 'revenue',
      header: 'ROI',
      render: (row) => {
        if (!row.revenue && !row.return_on_investment) {
          return <span className="text-[11px] text-slate-400">-</span>;
        }
        const roi = row.return_on_investment || 0;
        const roiColor = roi > 0 ? 'text-emerald-700' : roi < 0 ? 'text-red-700' : 'text-slate-700';
        return (
          <div className="space-y-0.5">
            {row.revenue && (
              <div className="text-slate-900">
                {row.revenue.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'INR' })}
              </div>
            )}
            {row.return_on_investment !== undefined && (
              <div className={`text-[11px] font-semibold ${roiColor}`}>
                ROI: {roi.toFixed(1)}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingCampaign(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCampaign(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCampaign) {
        await update(editingCampaign.id, data);
        showToast('success', 'Campaign Updated', `Campaign "${data.name}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Campaign Created', `Campaign "${data.name}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (campaignToDelete) {
      try {
        await remove(campaignToDelete.id);
        showToast('success', 'Campaign Deleted', `Campaign "${campaignToDelete.name}" has been deleted successfully.`);
        setCampaignToDelete(null);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete campaign. Please try again.');
      }
    }
  };

  const handleCreateAsset = async (data: Omit<MarketingAsset, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await marketingApi.createAsset(data);
      setAssetModalOpen(false);
      setEditingAsset(null);
      await loadAssets();
      showToast('success', 'Asset Created', 'Asset created successfully!');
    } catch (error) {
      showToast('error', 'Creation Failed', 'Failed to create asset. Please try again.');
    }
  };

  const handleUpdateAsset = async (data: Omit<MarketingAsset, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingAsset) {
      try {
        await marketingApi.updateAsset(editingAsset.id, data);
        setAssetModalOpen(false);
        setEditingAsset(null);
        await loadAssets();
        showToast('success', 'Asset Updated', 'Asset updated successfully!');
      } catch (error) {
        showToast('error', 'Update Failed', 'Failed to update asset. Please try again.');
      }
    }
  };

  const handleDeleteAsset = (asset: MarketingAsset) => {
    setAssetToDelete(asset);
    setAssetDeleteConfirmOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (assetToDelete) {
      try {
        await marketingApi.deleteAsset(assetToDelete.id);
        await loadAssets();
        showToast('success', 'Asset Deleted', `Asset "${assetToDelete.name}" has been deleted successfully.`);
        setAssetToDelete(null);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete asset. Please try again.');
      }
    }
  };

  const handleCreateLead = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await marketingApi.createLead(data);
      setLeadModalOpen(false);
      setEditingLead(null);
      await loadLeads();
      showToast('success', 'Lead Created', 'Lead created successfully!');
    } catch (error) {
      showToast('error', 'Creation Failed', 'Failed to create lead. Please try again.');
    }
  };

  const handleUpdateLead = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingLead) {
      try {
        await marketingApi.updateLead(editingLead.id, data);
        setLeadModalOpen(false);
        setEditingLead(null);
        await loadLeads();
        showToast('success', 'Lead Updated', 'Lead updated successfully!');
      } catch (error) {
        showToast('error', 'Update Failed', 'Failed to update lead. Please try again.');
      }
    }
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setLeadDeleteConfirmOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (leadToDelete) {
      try {
        await marketingApi.deleteLead(leadToDelete.id);
        await loadLeads();
        showToast('success', 'Lead Deleted', `Lead "${leadToDelete.first_name} ${leadToDelete.last_name}" has been deleted successfully.`);
        setLeadToDelete(null);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete lead. Please try again.');
      }
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const searchLower = (leadSearchTerm || '').toLowerCase();
    const matchesSearch =
      !leadSearchTerm ||
      (lead.first_name && lead.first_name.toLowerCase().includes(searchLower)) ||
      (lead.last_name && lead.last_name.toLowerCase().includes(searchLower)) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
      (lead.phone && lead.phone.toLowerCase().includes(searchLower)) ||
      (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
      (lead.job_title && lead.job_title.toLowerCase().includes(searchLower)) ||
      (lead.source && lead.source.toLowerCase().includes(searchLower)) ||
      (lead.lead_code && lead.lead_code.toLowerCase().includes(searchLower)) ||
      (lead.campaign_name && lead.campaign_name.toLowerCase().includes(searchLower));
    
    const matchesCampaign = leadCampaignFilter === 'all' || lead.campaign_id === leadCampaignFilter;
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    
    return matchesSearch && matchesCampaign && matchesStatus;
  });

  // Leads pagination
  const leadsTotalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const leadsStartIndex = (leadsCurrentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(leadsStartIndex, leadsStartIndex + itemsPerPage);

  // Leads table columns
  const leadColumns: TableColumn<Lead>[] = [
    {
      key: 'lead_code',
      header: 'Code',
      render: (row) => row.lead_code || row.id,
    },
    {
      key: 'name',
      header: 'Lead',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">
            {row.first_name || row.last_name 
              ? `${row.first_name || ''} ${row.last_name || ''}`.trim()
              : 'Unnamed Lead'}
          </div>
          {row.email && (
            <div className="text-[10px] text-slate-500">{row.email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (row) => {
        if (!row.company) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-900">{row.company}</span>
            {row.job_title && (
              <div className="text-[10px] text-slate-500">{row.job_title}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'campaign_id',
      header: 'Campaign',
      render: (row) => {
        if (!row.campaign_id && !row.campaign_name) return <span className="text-[11px] text-slate-400">-</span>;
        const campaign = campaigns.find(c => c.id === row.campaign_id);
        return (
          <span className="text-[11px] text-slate-600">
            {row.campaign_name || campaign?.name || row.campaign_id}
          </span>
        );
      },
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => {
        if (!row.source) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <Badge tone="neutral" variant="outline">
            {row.source}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'CONVERTED'
            ? 'success'
            : row.status === 'QUALIFIED'
            ? 'brand'
            : row.status === 'CONTACTED'
            ? 'warning'
            : row.status === 'LOST'
            ? 'danger'
            : 'neutral';
        return (
          <Badge tone={statusTone}>
            {row.status || 'NEW'}
          </Badge>
        );
      },
    },
    {
      key: 'score',
      header: 'Score',
      render: (row) => {
        if (row.score === undefined || row.score === null) return <span className="text-[11px] text-slate-400">-</span>;
        const scoreColor = row.score >= 75 ? 'text-emerald-700' : row.score >= 50 ? 'text-yellow-700' : 'text-slate-700';
        return (
          <span className={`text-[11px] font-semibold ${scoreColor}`}>
            {row.score}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (row) => {
        if (!row.phone) return <span className="text-[11px] text-slate-400">-</span>;
        return <span className="text-[11px] text-slate-600">{row.phone}</span>;
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingLead(row);
              setLeadModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteLead(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const searchLower = (assetSearchTerm || '').toLowerCase();
    const matchesSearch =
      !assetSearchTerm ||
      (asset.name || '').toLowerCase().includes(searchLower) ||
      (asset.asset_code && asset.asset_code.toLowerCase().includes(searchLower)) ||
      (asset.url && asset.url.toLowerCase().includes(searchLower)) ||
      (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    
    const matchesCampaign = assetCampaignFilter === 'all' || asset.campaign_id === assetCampaignFilter;
    const matchesType = assetTypeFilter === 'all' || asset.type === assetTypeFilter;
    
    return matchesSearch && matchesCampaign && matchesType;
  });

  // Assets pagination
  const assetsTotalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const assetsStartIndex = (assetsCurrentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(assetsStartIndex, assetsStartIndex + itemsPerPage);

  // Assets table columns
  const assetColumns: TableColumn<MarketingAsset>[] = [
    {
      key: 'asset_code',
      header: 'Code',
      render: (row) => row.asset_code || row.id,
    },
    {
      key: 'name',
      header: 'Asset Name',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline"
            >
              View Asset
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        if (!row.type) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <Badge tone="neutral" variant="outline">
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: 'campaign_id',
      header: 'Campaign',
      render: (row) => {
        if (!row.campaign_id) return <span className="text-[11px] text-slate-400">-</span>;
        const campaign = campaigns.find(c => c.id === row.campaign_id);
        return (
          <span className="text-[11px] text-slate-600">
            {campaign?.name || row.campaign_id}
          </span>
        );
      },
    },
    {
      key: 'file_size',
      header: 'File Size',
      render: (row) => {
        if (!row.file_size) return <span className="text-[11px] text-slate-400">-</span>;
        const formatFileSize = (bytes: number): string => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        };
        return <span className="text-[11px] text-slate-600">{formatFileSize(row.file_size)}</span>;
      },
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) => {
        if (!row.tags || row.tags.length === 0) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {row.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} tone="neutral" variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {row.tags.length > 3 && (
              <span className="text-[10px] text-slate-500">+{row.tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingAsset(row);
              setAssetModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteAsset(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Marketing Campaigns
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage marketing campaigns, track performance metrics, monitor ROI, and optimize campaigns across multiple channels.
          </p>
        </div>
        {mainTab === 'campaigns' ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCampaign(null);
              setModalOpen(true);
            }}
          >
            New Campaign
          </Button>
        ) : mainTab === 'assets' ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAsset(null);
              setAssetModalOpen(true);
            }}
          >
            New Asset
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingLead(null);
              setLeadModalOpen(true);
            }}
          >
            New Lead
          </Button>
        )}
      </div>

      {/* Stats */}
      {mainTab === 'campaigns' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Campaigns"
              value={metrics.totalCampaigns.toString()}
              helper="All campaigns in system."
              trend="up"
              variant="teal"
            />
            <StatCard
              label="Active Campaigns"
              value={metrics.activeCampaigns.toString()}
              helper="Currently running."
              trend="up"
              variant="blue"
            />
            <StatCard
              label="Total Budget"
              value={metrics.totalBudget.toLocaleString(undefined, {
                style: 'currency',
                currency: 'INR'
              })}
              helper="Across all campaigns."
              trend="up"
              variant="yellow"
            />
            <StatCard
              label="Total Leads"
              value={metrics.totalLeads.toString()}
              helper="Generated from campaigns."
              trend="up"
              variant="purple"
            />
            <StatCard
              label="Avg CTR"
              value={`${metrics.averageCTR.toFixed(2)}%`}
              helper="Average click-through rate."
              trend="up"
              variant="yellow"
            />
          </div>

          {/* Additional Performance Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Total Impressions</p>
              <p className="text-2xl font-bold text-slate-900">
                {metrics.totalImpressions.toLocaleString()}
              </p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Total Clicks</p>
              <p className="text-2xl font-bold text-slate-900">
                {metrics.totalClicks.toLocaleString()}
              </p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Positive ROI Campaigns</p>
              <p className="text-2xl font-bold text-slate-900">
                {metricsByStatus.positiveRoi}
              </p>
            </Card>
          </div>
        </>
      )}

      {/* Main Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'campaigns', label: `All Campaign (${campaigns.length})` },
            { id: 'assets', label: `Assets (${assets.length})` },
            { id: 'leads', label: `Leads (${leads.length})` },
          ]}
          activeId={mainTab}
          onChange={(id) => {
            setMainTab(id as 'campaigns' | 'assets' | 'leads');
            setCurrentPage(1);
            setAssetsCurrentPage(1);
            setLeadsCurrentPage(1);
          }}
        />

        {mainTab === 'campaigns' ? (
          <>
            {/* Status Filter Tabs */}
            <Tabs
              items={[
                { id: 'all', label: 'All' },
                { id: 'active', label: `Active (${statusCounts.active})` },
                { id: 'paused', label: `Paused (${statusCounts.paused})` },
                { id: 'completed', label: `Completed (${statusCounts.completed})` },
                { id: 'draft', label: `Draft (${statusCounts.draft})` },
                { id: 'scheduled', label: `Scheduled (${statusCounts.scheduled})` },
                { id: 'archived', label: `Archived (${statusCounts.archived})` },
                { id: 'cancelled', label: `Cancelled (${statusCounts.cancelled})` },
              ]}
              activeId={statusTab}
              onChange={(id) => {
                setStatusTab(id as typeof statusTab);
                setCurrentPage(1);
              }}
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by campaign name, code, description, channel, or manager..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </Select>
              <Select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Channels</option>
                {Array.from(new Set(campaigns.map((c) => c.channel))).map((channel) => (
                  <option key={channel} value={channel}>
                    {channel.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-12 sm:py-16">
                <LoadingState label="Loading campaigns..." size="md" variant="default" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <EmptyState
                title="No campaigns found"
                description={
                  searchTerm || statusFilter !== 'all' || channelFilter !== 'all' || statusTab !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Create your first campaign to get started.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={columns}
                    data={paginatedCampaigns}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onChange={setCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredCampaigns.length)}</span> of <span className="font-medium text-slate-900">{filteredCampaigns.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : mainTab === 'assets' ? (
          <>
            {/* Assets Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by asset name, code, URL, or tags..."
                  value={assetSearchTerm}
                  onChange={(e) => {
                    setAssetSearchTerm(e.target.value);
                    setAssetsCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={assetCampaignFilter}
                onChange={(e) => {
                  setAssetCampaignFilter(e.target.value);
                  setAssetsCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
              <Select
                value={assetTypeFilter}
                onChange={(e) => {
                  setAssetTypeFilter(e.target.value);
                  setAssetsCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Types</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="AUDIO">Audio</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            {/* Assets Table */}
            {assetsLoading ? (
              <div className="py-12 sm:py-16">
                <LoadingState label="Loading assets..." size="md" variant="default" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <EmptyState
                title="No assets found"
                description={
                  assetSearchTerm || assetCampaignFilter !== 'all' || assetTypeFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Create your first asset to get started.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={assetColumns}
                    data={paginatedAssets}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Assets Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setAssetsCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={assetsCurrentPage}
                        totalPages={assetsTotalPages}
                        onChange={setAssetsCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{assetsStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(assetsStartIndex + itemsPerPage, filteredAssets.length)}</span> of <span className="font-medium text-slate-900">{filteredAssets.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Leads Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, phone, company, source, or code..."
                  value={leadSearchTerm}
                  onChange={(e) => {
                    setLeadSearchTerm(e.target.value);
                    setLeadsCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={leadCampaignFilter}
                onChange={(e) => {
                  setLeadCampaignFilter(e.target.value);
                  setLeadsCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
              <Select
                value={leadStatusFilter}
                onChange={(e) => {
                  setLeadStatusFilter(e.target.value);
                  setLeadsCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </Select>
            </div>

            {/* Leads Table */}
            {leadsLoading ? (
              <div className="py-12 sm:py-16">
                <LoadingState label="Loading leads..." size="md" variant="default" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                title="No leads found"
                description={
                  leadSearchTerm || leadCampaignFilter !== 'all' || leadStatusFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Create your first lead to get started.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={leadColumns}
                    data={paginatedLeads}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Leads Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setLeadsCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={leadsCurrentPage}
                        totalPages={leadsTotalPages}
                        onChange={setLeadsCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{leadsStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(leadsStartIndex + itemsPerPage, filteredLeads.length)}</span> of <span className="font-medium text-slate-900">{filteredLeads.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* Campaign Modal */}
      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'New Campaign'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCampaign(null);
        }}
        hideCloseButton
      >
        <CampaignForm
          initial={editingCampaign || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingCampaign(null);
          }}
        />
      </Modal>

      {/* Asset Modal */}
      <Modal
        title={editingAsset ? 'Edit Asset' : 'New Asset'}
        open={assetModalOpen}
        onClose={() => {
          setAssetModalOpen(false);
          setEditingAsset(null);
        }}
        hideCloseButton
      >
        <AssetForm
          initial={editingAsset || undefined}
          campaigns={campaigns}
          onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
          onCancel={() => {
            setAssetModalOpen(false);
            setEditingAsset(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Campaign"
        message={
          campaignToDelete
            ? `Are you sure you want to delete "${campaignToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          await confirmDeleteCampaign();
          setDeleteConfirmOpen(false);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCampaignToDelete(null);
        }}
      />

      <ConfirmDialog
        open={assetDeleteConfirmOpen}
        title="Delete Asset"
        message={
          assetToDelete
            ? `Are you sure you want to delete "${assetToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          await confirmDeleteAsset();
          setAssetDeleteConfirmOpen(false);
        }}
        onCancel={() => {
          setAssetDeleteConfirmOpen(false);
          setAssetToDelete(null);
        }}
      />

      {/* Lead Modal */}
      <Modal
        title={editingLead ? 'Edit Lead' : 'New Lead'}
        open={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setEditingLead(null);
        }}
        hideCloseButton
      >
        <LeadForm
          initial={editingLead || undefined}
          campaigns={campaigns}
          onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
          onCancel={() => {
            setLeadModalOpen(false);
            setEditingLead(null);
          }}
        />
      </Modal>

      {/* Lead Delete Confirmation Dialog */}
      <ConfirmDialog
        open={leadDeleteConfirmOpen}
        title="Delete Lead"
        message={
          leadToDelete
            ? `Are you sure you want to delete lead "${((leadToDelete.first_name || '') + ' ' + (leadToDelete.last_name || '')).trim() || leadToDelete.email || 'this lead'}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          await confirmDeleteLead();
          setLeadDeleteConfirmOpen(false);
        }}
        onCancel={() => {
          setLeadDeleteConfirmOpen(false);
          setLeadToDelete(null);
        }}
      />
    </div>
  );
}
