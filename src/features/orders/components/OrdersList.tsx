import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { SalesOrder } from '../types';
import { OrderForm } from './OrderForm';

export function OrdersList() {
  const { orders, loading, create, remove, metrics } = useOrders();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<SalesOrder>[] = [
    { key: 'date', header: 'Date' },
    { key: 'customer', header: 'Customer' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const color =
          row.status === 'PENDING'
            ? 'bg-amber-50 text-amber-700'
            : row.status === 'CONFIRMED'
            ? 'bg-sky-50 text-sky-700'
            : row.status === 'SHIPPED'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700';
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}
          >
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) =>
        row.total_amount.toLocaleString(undefined, {
          style: 'currency',
          currency: row.currency
        })
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
            Order Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track demo sales orders from creation through shipment using a Supabase-ready
            API.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending orders"
          value={metrics.pending.toString()}
          helper="Awaiting confirmation or fulfilment."
          trend={metrics.pending > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Confirmed orders"
          value={metrics.confirmed.toString()}
          helper="Ready to be picked and packed."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Total order value"
          value={metrics.totalValue.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="All demo orders in this tenant."
          trend="up"
          variant="teal"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Sales orders</h2>
          {loading && <LoadingState label="Loading sales orders..." />}
        </div>
        {orders.length === 0 && !loading ? (
          <EmptyState
            title="No sales orders yet"
            description="Create your first demo order to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={orders}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No sales orders found."
          />
        )}
      </Card>

      <Modal
        title="New sales order"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <OrderForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

