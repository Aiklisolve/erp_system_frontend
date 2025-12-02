import { useState } from 'react';
import { useMarketing } from '../hooks/useMarketing';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Campaign } from '../types';
import { CampaignForm } from './CampaignForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Badge } from '../../../components/ui/Badge';

export function CampaignList() {
  const { campaigns, loading, create, remove, metrics } = useMarketing();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Campaign>[] = [
    { key: 'name', header: 'Campaign name' },
    {
      key: 'channel',
      header: 'Channel',
      render: (row) => (
        <Badge tone="neutral" variant="outline">
          {row.channel.replace('_', ' ')}
        </Badge>
      )
    },
    { key: 'start_date', header: 'Start date' },
    { key: 'end_date', header: 'End date' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'ACTIVE'
              ? 'success'
              : row.status === 'PAUSED'
              ? 'warning'
              : row.status === 'COMPLETED'
              ? 'brand'
              : row.status === 'CANCELLED'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
        </Badge>
      )
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) =>
        row.budget.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    },
    {
      key: 'impressions',
      header: 'Performance',
      render: (row) => {
        const ctr = row.impressions && row.impressions > 0
          ? ((row.clicks ?? 0) / row.impressions * 100).toFixed(2)
          : '0.00';
        return (
          <div className="text-xs text-text-secondary">
            <div>Impr: {row.impressions?.toLocaleString() ?? 0}</div>
            <div>Clicks: {row.clicks?.toLocaleString() ?? 0}</div>
            <div className="font-medium">CTR: {ctr}%</div>
          </div>
        );
      }
    },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(row.id)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Marketing Campaigns"
          description="Manage your marketing campaigns, track performance metrics, and monitor ROI. In production this would be backed by the `marketing_campaigns` table in Supabase."
        />
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          New campaign
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total campaigns"
          value={metrics.totalCampaigns.toString()}
          helper="All campaigns in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active campaigns"
          value={metrics.activeCampaigns.toString()}
          helper="Currently running."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Total budget"
          value={metrics.totalBudget.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="Across all campaigns."
          trend="up"
          variant="yellow"
        />
        <StatCard
          label="Total leads"
          value={metrics.totalLeads.toString()}
          helper="Generated from campaigns."
          trend="up"
          variant="purple"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-text-secondary">Total Impressions</p>
          <p className="text-2xl font-bold text-text-primary">
            {metrics.totalImpressions.toLocaleString()}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-text-secondary">Total Clicks</p>
          <p className="text-2xl font-bold text-text-primary">
            {metrics.totalClicks.toLocaleString()}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-text-secondary">Average CTR</p>
          <p className="text-2xl font-bold text-text-primary">
            {metrics.averageCTR.toFixed(2)}%
          </p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Campaigns</h2>
          {loading && <LoadingState label="Loading campaigns..." />}
        </div>
        {campaigns.length === 0 && !loading ? (
          <EmptyState
            title="No campaigns yet"
            description="Create your first demo marketing campaign to see it appear here."
          />
        ) : (
          <Table
            columns={columns}
            data={campaigns}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No campaigns found."
          />
        )}
      </Card>

      <Modal
        title="New marketing campaign"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <CampaignForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
