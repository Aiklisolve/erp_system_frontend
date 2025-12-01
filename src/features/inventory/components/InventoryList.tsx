import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { InventoryItem } from '../types';
import { InventoryForm } from './InventoryForm';

export function InventoryList() {
  const { items, loading, create, remove, metrics } = useInventory();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<InventoryItem>[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'qty_on_hand',
      header: 'On hand',
      render: (row) => (
        <span
          className={
            row.qty_on_hand <= row.reorder_level
              ? 'text-red-600 font-semibold'
              : 'text-slate-800'
          }
        >
          {row.qty_on_hand}
        </span>
      )
    },
    { key: 'reorder_level', header: 'Reorder at' },
    { key: 'location', header: 'Location' },
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
            Inventory Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Monitor stock levels, locations, and reorder points for all SKUs in this demo
            tenant.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New item
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total items"
          value={metrics.totalItems.toString()}
          helper="Unique SKUs tracked."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Low stock items"
          value={metrics.lowStock.toString()}
          helper="At or below reorder level."
          trend={metrics.lowStock > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Total on-hand quantity"
          value={metrics.totalQty.toString()}
          helper="Across all locations."
          trend="flat"
          variant="blue"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Inventory items</h2>
          {loading && <LoadingState label="Loading inventory..." />}
        </div>
        {items.length === 0 && !loading ? (
          <EmptyState
            title="No inventory items yet"
            description="Create your first demo inventory item to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={items}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No inventory items found."
          />
        )}
      </Card>

      <Modal
        title="New inventory item"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <InventoryForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

