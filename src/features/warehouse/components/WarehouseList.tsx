import { useState } from 'react';
import { useWarehouse } from '../hooks/useWarehouse';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { StockMovement } from '../types';
import { WarehouseForm } from './WarehouseForm';

export function WarehouseList() {
  const { movements, loading, create, remove, metrics } = useWarehouse();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<StockMovement>[] = [
    { key: 'movement_date', header: 'Date' },
    { key: 'item_id', header: 'Item ID' },
    { key: 'from_location', header: 'From' },
    { key: 'to_location', header: 'To' },
    { key: 'quantity', header: 'Qty' },
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
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Record demo stock movements between locations to illustrate how goods flow
            through your network.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New stock movement
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total movements"
          value={metrics.totalMoves.toString()}
          helper="All transfers in this view."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Total quantity moved"
          value={metrics.totalQty.toString()}
          helper="Sum of moved units."
          trend="flat"
          variant="blue"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Stock movements
          </h2>
          {loading && <LoadingState label="Loading stock movements..." />}
        </div>
        {movements.length === 0 && !loading ? (
          <EmptyState
            title="No stock movements yet"
            description="Create your first demo stock movement to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={movements}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No stock movements found."
          />
        )}
      </Card>

      <Modal
        title="New stock movement"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <WarehouseForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

