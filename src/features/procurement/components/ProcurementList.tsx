import { useState } from 'react';
import { useProcurement } from '../hooks/useProcurement';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { PurchaseOrder } from '../types';
import { ProcurementForm } from './ProcurementForm';

export function ProcurementList() {
  const { orders, loading, create, remove, metrics } = useProcurement();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<PurchaseOrder>[] = [
    { key: 'date', header: 'Date' },
    { key: 'supplier', header: 'Supplier' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            row.status === 'DRAFT'
              ? 'bg-slate-800 text-slate-200'
              : row.status === 'SENT'
              ? 'bg-amber-500/15 text-amber-200 border border-amber-400/60'
              : 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/60'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) =>
        row.total_amount.toLocaleString(undefined, {
          style: 'currency',
          currency: 'USD'
        })
    },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => remove(row.id)}
          className="text-[11px] text-amber-300 hover:text-amber-200"
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
            Procurement
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage demo purchase orders across suppliers. In production this would be
            backed by a `purchase_orders` table in Supabase.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New purchase order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total purchase orders"
          value={metrics.total.toString()}
          helper="All demo POs in this tenant."
          trend="up"
        />
        <StatCard
          label="Open (not received)"
          value={metrics.open.toString()}
          helper="Draft + sent documents still in-flight."
          trend="up"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Purchase orders</h2>
          {loading && <LoadingState label="Loading purchase orders..." />}
        </div>
        {orders.length === 0 && !loading ? (
          <EmptyState
            title="No purchase orders yet"
            description="Create your first demo purchase order to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={orders}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No purchase orders found."
          />
        )}
      </Card>

      <Modal
        title="New purchase order"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ProcurementForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

