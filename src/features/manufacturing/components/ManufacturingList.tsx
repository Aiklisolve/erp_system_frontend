import { useState } from 'react';
import { useManufacturing } from '../hooks/useManufacturing';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { ProductionOrder } from '../types';
import { ManufacturingForm } from './ManufacturingForm';

export function ManufacturingList() {
  const { orders, loading, create, remove, metrics } = useManufacturing();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<ProductionOrder>[] = [
    { key: 'product', header: 'Product' },
    { key: 'planned_qty', header: 'Planned qty' },
    { key: 'start_date', header: 'Start' },
    { key: 'end_date', header: 'End' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            row.status === 'PLANNED'
              ? 'bg-slate-100 text-slate-700'
              : row.status === 'IN_PROGRESS'
              ? 'bg-sky-100 text-sky-800'
              : row.status === 'COMPLETED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => remove(row.id)}
          className="text-[11px] text-red-500 hover:text-red-600"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Manufacturing
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Plan and monitor production orders across your facilities using simple,
            Supabase-ready mock data.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New production order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total production orders"
          value={metrics.total.toString()}
          helper="All demo orders in this tenant."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="In progress"
          value={metrics.inProgress.toString()}
          helper="Currently running on the shop floor."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Completed"
          value={metrics.completed.toString()}
          helper="Closed in the selected horizon."
          trend="flat"
          variant="purple"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Production orders
          </h2>
          {loading && <LoadingState label="Loading production orders..." />}
        </div>
        {orders.length === 0 && !loading ? (
          <EmptyState
            title="No production orders yet"
            description="Create your first demo production order to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={orders}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No production orders found."
          />
        )}
      </Card>

      <Modal
        title="New production order"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ManufacturingForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

