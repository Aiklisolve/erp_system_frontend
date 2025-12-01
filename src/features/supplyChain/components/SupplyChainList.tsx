import { useState } from 'react';
import { useSupplyChain } from '../hooks/useSupplyChain';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Supplier } from '../types';
import { SupplierForm } from './SupplierForm';

export function SupplyChainList() {
  const { suppliers, loading, create, remove, metrics } = useSupplyChain();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Supplier>[] = [
    { key: 'name', header: 'Supplier' },
    { key: 'contact_person', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {row.rating.toFixed(1)}
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
            Supply Chain Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage demo suppliers and track average performance rating across your
            network.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New supplier
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total suppliers"
          value={metrics.total.toString()}
          helper="Active relationships in this view."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Average rating"
          value={metrics.avgRating.toString()}
          helper="Based on demo data only."
          trend="flat"
          variant="blue"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Suppliers</h2>
          {loading && <LoadingState label="Loading suppliers..." />}
        </div>
        {suppliers.length === 0 && !loading ? (
          <EmptyState
            title="No suppliers yet"
            description="Create your first demo supplier to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={suppliers}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No suppliers found."
          />
        )}
      </Card>

      <Modal
        title="New supplier"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <SupplierForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

