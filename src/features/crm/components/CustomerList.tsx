import { useState } from 'react';
import { useCrm } from '../hooks/useCrm';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Customer } from '../types';
import { CustomerForm } from './CustomerForm';

export function CustomerList() {
  const { customers, loading, create, remove, metrics } = useCrm();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Customer>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'segment', header: 'Segment' },
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

  const total = metrics.total;
  const topSegment =
    total === 0
      ? '—'
      : Object.entries(metrics.bySegment).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            CRM
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage demo customer records and see how segments contribute to your overall
            relationship mix.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New customer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total customers"
          value={total.toString()}
          helper="In this demo tenant."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Top segment"
          value={topSegment}
          helper="Most represented customer segment."
          trend="flat"
          variant="blue"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Customers
          </h2>
          {loading && <LoadingState label="Loading customers..." />}
        </div>
        {customers.length === 0 && !loading ? (
          <EmptyState
            title="No customers yet"
            description="Create your first demo customer to see them here."
          />
        ) : (
          <Table
            columns={columns}
            data={customers}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No customers found."
          />
        )}
      </Card>

      <Modal
        title="New customer"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <CustomerForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

