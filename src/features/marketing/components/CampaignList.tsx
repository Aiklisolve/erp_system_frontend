import { useState } from 'react';
import { useMarketing } from '../hooks/useMarketing';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Campaign } from '../types';
import { CampaignForm } from './CampaignForm';

export function CampaignList() {
  const { campaigns, loading, create, update, remove, refresh, metrics } = useMarketing();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter campaigns based on search, status, channel, and active tab
  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchLower) ||
      (campaign.campaign_code && campaign.campaign_code.toLowerCase().includes(searchLower)) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchLower)) ||
      (campaign.sub_channel && campaign.sub_channel.toLowerCase().includes(searchLower)) ||
      (campaign.campaign_manager && campaign.campaign_manager.toLowerCase().includes(searchLower)) ||
      campaign.channel.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || campaign.channel === channelFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && campaign.status === 'ACTIVE') ||
      (activeTab === 'paused' && campaign.status === 'PAUSED') ||
      (activeTab === 'completed' && campaign.status === 'COMPLETED');
    
    return matchesSearch && matchesStatus && matchesChannel && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(campaigns.map((c) => c.status)));
  const channels = Array.from(new Set(campaigns.map((c) => c.channel)));

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
              {budget.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'USD' })}
            </div>
            {spent > 0 && (
              <div className="text-[10px] text-slate-500">
                Spent: {spent.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'USD' })} ({spentPercent.toFixed(0)}%)
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
                {row.revenue.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'USD' })}
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
            onClick={() => remove(row.id)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingCampaign) {
      await update(editingCampaign.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingCampaign(null);
  };

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
      </div>

      {/* Stats */}
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
            currency: 'USD'
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

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Campaigns' },
            { id: 'active', label: 'Active' },
            { id: 'paused', label: 'Paused' },
            { id: 'completed', label: 'Completed' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'active' | 'paused' | 'completed');
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
            {channels.map((channel) => (
              <option key={channel} value={channel}>
                {channel.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading campaigns..." />
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description={
              searchTerm || statusFilter !== 'all' || channelFilter !== 'all' || activeTab !== 'all'
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
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Select
                  value={itemsPerPage.toString()}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-32"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </Select>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'New Campaign'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCampaign(null);
        }}
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
    </div>
  );
}
