import { useState, useMemo } from 'react';
import { useProcurement } from '../hooks/useProcurement';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';
import { ProcurementForm } from './ProcurementForm';

type SortDirection = 'none' | 'asc' | 'desc';

export function ProcurementList() {
  const { orders, loading, create, remove, metrics } = useProcurement();
  const [modalOpen, setModalOpen] = useState(false);

  // Filter states
  const [supplierSearch, setSupplierSearch] = useState('');
  const [dateSort, setDateSort] = useState<SortDirection>('none');
  const [amountSort, setAmountSort] = useState<SortDirection>('none');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'ALL'>('ALL');

  // Apply filters and sorting
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by supplier search
    if (supplierSearch.trim()) {
      result = result.filter((order) =>
        order.supplier.toLowerCase().includes(supplierSearch.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort by date
    if (dateSort !== 'none') {
      result.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Sort by amount (only if date sort is not active)
    if (amountSort !== 'none' && dateSort === 'none') {
      result.sort((a, b) =>
        amountSort === 'asc'
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount
      );
    }

    return result;
  }, [orders, supplierSearch, statusFilter, dateSort, amountSort]);

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
              ? 'bg-slate-200 text-slate-800'
              : row.status === 'SENT'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
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
          currency: 'INR'
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
        <StatCard
          label="Received"
          value={(metrics.total - metrics.open).toString()}
          helper="Completed purchase orders."
          trend="up"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Purchase orders</h2>
          {loading && <LoadingState label="Loading purchase orders..." />}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          <input
            type="text"
            placeholder="Search supplier..."
            value={supplierSearch}
            onChange={(e) => setSupplierSearch(e.target.value)}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <select
            value={dateSort}
            onChange={(e) => {
              setDateSort(e.target.value as SortDirection);
              if (e.target.value !== 'none') setAmountSort('none');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">Date: Default</option>
            <option value="asc">Date: Oldest first</option>
            <option value="desc">Date: Newest first</option>
          </select>

          <select
            value={amountSort}
            onChange={(e) => {
              setAmountSort(e.target.value as SortDirection);
              if (e.target.value !== 'none') setDateSort('none');
            }}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">Amount: Default</option>
            <option value="asc">Amount: Low to high</option>
            <option value="desc">Amount: High to low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | 'ALL')}
            className="font-sans rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Status: All</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>

        {filteredOrders.length === 0 && !loading ? (
          <EmptyState
            title={orders.length === 0 ? "No purchase orders yet" : "No matching orders"}
            description={orders.length === 0 
              ? "Create your first demo purchase order to see it here."
              : "Try adjusting your filters to see more results."
            }
          />
        ) : (
          <Table
            columns={columns}
            data={filteredOrders}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No purchase orders found."
          />
        )}
      </Card>

      <Modal
        title="New purchase order"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hideCloseButton
      >
        <ProcurementForm
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

