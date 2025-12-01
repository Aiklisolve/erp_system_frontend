import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { FinanceTransaction } from '../types';
import { FinanceForm } from './FinanceForm';

export function FinanceList() {
  const { transactions, loading, create, remove, summary } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<FinanceTransaction>[] = [
    { key: 'date', header: 'Date' },
    { key: 'type', header: 'Type' },
    { key: 'account', header: 'Account' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) =>
        row.amount.toLocaleString(undefined, { style: 'currency', currency: row.currency })
    },
    { key: 'status', header: 'Status' },
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
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Finance</h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track demo income and expense transactions. In production, this screen would
            read/write to the `finance_transactions` table in Supabase.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New transaction
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total income"
          value={summary.income.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          trend="up"
        />
        <StatCard
          label="Total expense"
          value={summary.expense.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          trend="down"
        />
        <StatCard
          label="Net"
          value={summary.net.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          trend={summary.net >= 0 ? 'up' : 'down'}
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Transactions
          </h2>
          {loading && <LoadingState label="Loading transactions..." />}
        </div>
        {transactions.length === 0 && !loading ? (
          <EmptyState
            title="No transactions yet"
            description="Create your first demo transaction to see it appear here."
          />
        ) : (
          <Table
            columns={columns}
            data={transactions}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No transactions found."
          />
        )}
      </Card>

      <Modal
        title="New finance transaction"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <FinanceForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}


