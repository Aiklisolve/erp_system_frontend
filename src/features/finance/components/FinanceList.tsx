import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { FinanceTransaction } from '../types';
import { FinanceForm } from './FinanceForm';
import { AccountManagement } from './AccountManagement';
import { ReceivedPayments } from './ReceivedPayments';
import { Transactions } from './Transactions';
import { TransferApprovals } from './TransferApprovals';

export function FinanceList() {
  const { transactions, loading, create, update, remove } = useFinance();
  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts' | 'payments' | 'history' | 'approvals'>('transactions');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchTerm === '' ||
      txn.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME' && t.status === 'POSTED')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'POSTED')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING' || t.status === 'DRAFT').length;
  const reconciledTransactions = transactions.filter((t) => t.is_reconciled).length;

  const tabs = [
    { id: 'transactions', label: 'Transactions', count: transactions.length },
    { id: 'accounts', label: 'Accounts', count: 0 },
    { id: 'payments', label: 'Received Payments', count: 0 },
    { id: 'history', label: 'Transaction History', count: 0 },
    { id: 'approvals', label: 'Transfer Approvals', count: 0 }
  ];

  const columns: TableColumn<FinanceTransaction>[] = [
    {
      key: 'transaction_number',
      header: 'Transaction #',
      render: (row) => (
        <div className="font-medium text-slate-900">
          {row.transaction_number}
          {row.reference_number && (
            <div className="text-[10px] text-slate-500">Ref: {row.reference_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{new Date(row.date).toLocaleDateString()}</div>
          {row.due_date && (
            <div className="text-[10px] text-slate-500">Due: {new Date(row.due_date).toLocaleDateString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge
          tone={
            row.type === 'INCOME'
              ? 'success'
              : row.type === 'EXPENSE'
              ? 'danger'
              : 'brand'
          }
        >
          {row.type}
        </Badge>
      )
    },
    {
      key: 'party_name',
      header: 'Party',
      render: (row) => (
        <div>
          {row.party_name ? (
            <>
              <div className="text-xs font-medium text-slate-900">{row.party_name}</div>
              {row.party_type && (
                <div className="text-[10px] text-slate-500">{row.party_type}</div>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      )
    },
    {
      key: 'account',
      header: 'Account',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{row.account}</div>
          <div className="text-[10px] text-slate-500">{row.account_type}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="text-right">
          <div className={`text-xs font-semibold ${
            row.type === 'INCOME' ? 'text-emerald-600' : row.type === 'EXPENSE' ? 'text-red-600' : 'text-slate-900'
          }`}>
            {row.type === 'EXPENSE' ? '-' : ''}
            {row.currency} {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {row.net_amount && row.net_amount !== row.amount && (
            <div className="text-[10px] text-slate-500">
              Net: {row.currency} {row.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'POSTED' || row.status === 'RECONCILED'
              ? 'success'
              : row.status === 'APPROVED'
              ? 'brand'
              : row.status === 'PENDING' || row.status === 'DRAFT'
              ? 'warning'
              : 'neutral'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      key: 'payment_method',
      header: 'Payment',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.payment_method.replace(/_/g, ' ')}</div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this transaction?')) {
                remove(row.id);
              }
            }}
            className="text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleCreate = async (data: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) => {
    await create(data);
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleUpdate = async (data: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTransaction) {
      await update(editingTransaction.id, data);
      setModalOpen(false);
      setEditingTransaction(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading finance data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Finance Management</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Comprehensive financial management including transactions, accounts, payments, and approvals
          </p>
        </div>
        {activeTab === 'transactions' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
          >
            + New Transaction
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Income"
          value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="up"
        />
        <StatCard
          label="Total Expense"
          value={`$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="down"
        />
        <StatCard
          label="Net Balance"
          value={`$${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={netBalance >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Pending"
          value={pendingTransactions.toString()}
        />
        <StatCard
          label="Reconciled"
          value={reconciledTransactions.toString()}
        />
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label
        }))}
        activeId={activeTab}
        onChange={(id) => {
          setActiveTab(id as any);
          setCurrentPage(1);
        }}
      />

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <Card>
          <div className="p-4 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Search
                </label>
                <Input
                  placeholder="Search by transaction #, party, account..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="POSTED">Posted</option>
                  <option value="RECONCILED">Reconciled</option>
                  <option value="VOID">Void</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Type
                </label>
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="TRANSFER">Transfer</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          {paginatedTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No transactions found"
                description="Create your first transaction or adjust your filters"
              />
              <div className="mt-4 text-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setEditingTransaction(null);
                    setModalOpen(true);
                  }}
                >
                  + New Transaction
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                data={paginatedTransactions}
                columns={columns}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
                <div className="mt-2 text-center text-xs text-slate-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {activeTab === 'accounts' && <AccountManagement />}
      {activeTab === 'payments' && <ReceivedPayments />}
      {activeTab === 'history' && <Transactions />}
      {activeTab === 'approvals' && <TransferApprovals />}

      {/* Modal for Transactions Tab */}
      {activeTab === 'transactions' && (
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTransaction(null);
          }}
          title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        >
          <FinanceForm
            initial={editingTransaction || undefined}
            onSubmit={editingTransaction ? handleUpdate : handleCreate}
            onCancel={() => {
              setModalOpen(false);
              setEditingTransaction(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
