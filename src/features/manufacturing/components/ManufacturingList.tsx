import { useState, useMemo } from 'react';
import { useManufacturing } from '../hooks/useManufacturing';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { ProductionOrder, ProductionOrderStatus } from '../types';
import { ManufacturingForm } from './ManufacturingForm';

type SortDirection = 'none' | 'asc' | 'desc';

export function ManufacturingList() {
  const { orders, loading, create, update, remove, metrics } = useManufacturing();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);

  // Filter states
  const [productSearch, setProductSearch] = useState('');
  const [qtySort, setQtySort] = useState<SortDirection>('none');
  const [costSort, setCostSort] = useState<SortDirection>('none');
  const [startDateSort, setStartDateSort] = useState<SortDirection>('none');
  const [endDateSort, setEndDateSort] = useState<SortDirection>('none');
  const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | 'ALL'>('ALL');

  // Clear other sorts when one is selected
  const clearOtherSorts = (keep: 'qty' | 'cost' | 'start' | 'end') => {
    if (keep !== 'qty') setQtySort('none');
    if (keep !== 'cost') setCostSort('none');
    if (keep !== 'start') setStartDateSort('none');
    if (keep !== 'end') setEndDateSort('none');
  };

  // Apply filters and sorting
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by product search
    if (productSearch.trim()) {
      result = result.filter((order) =>
        order.product.toLowerCase().includes(productSearch.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort by planned quantity
    if (qtySort !== 'none') {
      result.sort((a, b) =>
        qtySort === 'asc'
          ? a.planned_qty - b.planned_qty
          : b.planned_qty - a.planned_qty
      );
    }

    // Sort by cost
    if (costSort !== 'none') {
      result.sort((a, b) =>
        costSort === 'asc'
          ? a.cost - b.cost
          : b.cost - a.cost
      );
    }

    // Sort by start date
    if (startDateSort !== 'none') {
      result.sort((a, b) => {
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        return startDateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Sort by end date
    if (endDateSort !== 'none') {
      result.sort((a, b) => {
        const dateA = new Date(a.end_date).getTime();
        const dateB = new Date(b.end_date).getTime();
        return endDateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return result;
  }, [orders, productSearch, statusFilter, qtySort, costSort, startDateSort, endDateSort]);

  const columns: TableColumn<ProductionOrder>[] = [
    { key: 'product', header: 'Product' },
    { key: 'planned_qty', header: 'Planned qty' },
    {
      key: 'cost',
      header: 'Cost',
      render: (row) =>
        row.cost.toLocaleString(undefined, {
          style: 'currency',
          currency: 'INR'
        })
    },
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingOrder(row)}
            className="text-[11px] text-blue-500 hover:text-blue-600"
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          <input
            type="text"
            placeholder="Search product..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <select
            value={qtySort}
            onChange={(e) => {
              const val = e.target.value as SortDirection;
              setQtySort(val);
              if (val !== 'none') clearOtherSorts('qty');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">Qty: Default</option>
            <option value="asc">Qty: Low to high</option>
            <option value="desc">Qty: High to low</option>
          </select>

          <select
            value={costSort}
            onChange={(e) => {
              const val = e.target.value as SortDirection;
              setCostSort(val);
              if (val !== 'none') clearOtherSorts('cost');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">Cost: Default</option>
            <option value="asc">Cost: Low to high</option>
            <option value="desc">Cost: High to low</option>
          </select>

          <select
            value={startDateSort}
            onChange={(e) => {
              const val = e.target.value as SortDirection;
              setStartDateSort(val);
              if (val !== 'none') clearOtherSorts('start');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">Start: Default</option>
            <option value="asc">Start: Oldest first</option>
            <option value="desc">Start: Newest first</option>
          </select>

          <select
            value={endDateSort}
            onChange={(e) => {
              const val = e.target.value as SortDirection;
              setEndDateSort(val);
              if (val !== 'none') clearOtherSorts('end');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">End: Default</option>
            <option value="asc">End: Oldest first</option>
            <option value="desc">End: Newest first</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductionOrderStatus | 'ALL')}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Status: All</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {orders.length === 0 && !loading ? (
          <EmptyState
            title="No production orders yet"
            description="Create your first demo production order to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={filteredOrders}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No matching orders found. Try adjusting your filters."
          />
        )}
      </Card>

      <Modal
        title="New production order"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hideCloseButton
      >
        <ManufacturingForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        title="Edit production order"
        open={editingOrder !== null}
        onClose={() => setEditingOrder(null)}
        hideCloseButton
      >
        {editingOrder && (
          <ManufacturingForm
            initial={editingOrder}
            onSubmit={(values) => {
              void update(editingOrder.id, values);
              setEditingOrder(null);
            }}
            onCancel={() => setEditingOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}

