import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { TransactionHistory, TransactionDirection, ReconciliationStatus, PaymentMethod, Currency } from '../types';
import { apiRequest } from '../../../config/api';

// Mock data for transactions
const mockTransactions: TransactionHistory[] = [
  {
    id: 'txh-001',
    transaction_number: 'TXH-2025-001',
    category_id: 1,
    category_name: 'Sales Revenue',
    transaction_direction: 'IN',
    transaction_type: 'INCOME',
    transaction_title: 'Customer Payment - Acme Corp',
    transaction_description: 'Payment received for Invoice INV-2025-001',
    transaction_amount: 125000,
    transaction_date: '2025-01-05',
    transaction_status: 'POSTED',
    payment_method: 'BANK_TRANSFER',
    reference_number: 'REF-001',
    source_account_id: 1,
    source_account_name: 'Bank Account - Main',
    counterparty_name: 'Acme Manufacturing Corp',
    counterparty_details: 'Customer ID: CUST-001',
    approval_required: true,
    approved_by_emp_id: 1,
    approved_by_name: 'Sarah Johnson',
    approval_datetime: '2025-01-05T10:30:00',
    approval_comments: 'Approved - verified with bank statement',
    reconciliation_status: 'RECONCILED',
    reconciled_by_emp_id: 2,
    reconciled_by_name: 'Mike Wilson',
    reconciliation_date: '2025-01-06',
    tags: ['sales', 'customer-payment'],
    currency: 'USD',
    created_at: '2025-01-05'
  },
  {
    id: 'txh-002',
    transaction_number: 'TXH-2025-002',
    category_id: 2,
    category_name: 'Operating Expenses',
    transaction_direction: 'OUT',
    transaction_type: 'EXPENSE',
    transaction_title: 'Cloud Services Payment',
    transaction_description: 'Monthly AWS hosting charges',
    transaction_amount: 8500,
    transaction_date: '2025-01-06',
    transaction_status: 'POSTED',
    payment_method: 'CREDIT_CARD',
    reference_number: 'REF-002',
    source_account_id: 2,
    source_account_name: 'Credit Card - Business',
    counterparty_name: 'AWS Cloud Services',
    approval_required: true,
    approved_by_emp_id: 1,
    approved_by_name: 'Sarah Johnson',
    approval_datetime: '2025-01-06T09:15:00',
    reconciliation_status: 'RECONCILED',
    tags: ['cloud', 'infrastructure'],
    currency: 'USD',
    created_at: '2025-01-06'
  },
  {
    id: 'txh-003',
    transaction_number: 'TXH-2025-003',
    category_id: 3,
    category_name: 'Internal Transfer',
    transaction_direction: 'TRANSFER',
    transaction_type: 'TRANSFER',
    transaction_title: 'Transfer to Petty Cash',
    transaction_description: 'Monthly petty cash replenishment',
    transaction_amount: 5000,
    transaction_date: '2025-01-15',
    transaction_status: 'PENDING',
    payment_method: 'BANK_TRANSFER',
    reference_number: 'REF-003',
    source_account_id: 1,
    source_account_name: 'Bank Account - Main',
    destination_account_id: 3,
    destination_account_name: 'Cash Account - Petty Cash',
    approval_required: true,
    reconciliation_status: 'PENDING',
    tags: ['internal', 'petty-cash'],
    currency: 'USD',
    created_at: '2025-01-15'
  }
];

// Map backend transaction to TransactionHistory format
function mapBackendToHistory(backendTx: any): TransactionHistory {
  const txId = backendTx.id?.toString();
  
  // Determine direction based on transaction_type
  let direction: TransactionDirection = 'OUT';
  if (backendTx.transaction_type === 'INCOME') direction = 'IN';
  else if (backendTx.transaction_type === 'TRANSFER') direction = 'TRANSFER';
  else if (backendTx.transaction_type === 'EXPENSE') direction = 'OUT';
  
  // Extract account names from nested objects
  const sourceAccountName = backendTx.from_account?.account_name 
    || backendTx.source_account_name 
    || backendTx.account_name 
    || 'General Account';
  
  // For TRANSFER transactions, always try to get destination account name
  const destinationAccountName = backendTx.to_account?.account_name 
    || backendTx.destination_account_name 
    || (backendTx.transaction_type === 'TRANSFER' && backendTx.to_account_id ? `Account ID: ${backendTx.to_account_id}` : '');
  
  // Extract customer/vendor name from nested objects
  const counterpartyName = backendTx.customer?.name 
    || backendTx.vendor?.name
    || backendTx.counterparty_name 
    || backendTx.vendor_name 
    || backendTx.customer_name 
    || '';
  
  // Extract customer details
  const counterpartyDetails = backendTx.customer 
    ? `Customer ID: ${backendTx.customer.id || backendTx.customer.customer_number || ''}, Email: ${backendTx.customer.email || 'N/A'}`
    : backendTx.counterparty_details || '';
  
  // Extract created by user name
  const createdByName = backendTx.created_by_user?.full_name 
    || backendTx.created_by_user?.email
    || backendTx.created_by_name 
    || '';
  
  return {
    id: txId,
    transaction_number: backendTx.transaction_number || '',
    category_id: backendTx.category_id,
    category_name: backendTx.category || 'General',
    transaction_direction: direction,
    transaction_type: backendTx.transaction_type || 'EXPENSE',
    transaction_title: backendTx.description || `${backendTx.transaction_type} - ${backendTx.category || 'General'}`,
    transaction_description: backendTx.description || '',
    transaction_amount: parseFloat(backendTx.amount) || 0,
    transaction_date: backendTx.transaction_date ? new Date(backendTx.transaction_date).toISOString().split('T')[0] : '',
    transaction_status: backendTx.status || 'POSTED',
    payment_method: backendTx.payment_method?.toUpperCase().replace(/\s+/g, '_') as any,
    reference_number: backendTx.reference_number || '',
    source_account_id: backendTx.from_account?.account_id || backendTx.account_id || backendTx.source_account_id,
    source_account_name: sourceAccountName,
    destination_account_id: backendTx.to_account?.account_id || backendTx.to_account_id || backendTx.destination_account_id,
    destination_account_name: destinationAccountName,
    counterparty_name: counterpartyName,
    counterparty_details: counterpartyDetails,
    approval_required: backendTx.approval_required ?? false,
    approved_by_name: backendTx.approved_by_name || backendTx.approved_by || '',
    approval_datetime: backendTx.approval_datetime || backendTx.approved_at || '',
    approval_comments: backendTx.approval_comments || '',
    reconciliation_status: (backendTx.reconciliation_status || (backendTx.status === 'COMPLETED' ? 'RECONCILED' : 'PENDING')) as ReconciliationStatus,
    reconciled_by_name: backendTx.reconciled_by_name || backendTx.reconciled_by || '',
    reconciliation_date: backendTx.reconciliation_date || backendTx.reconciled_at || '',
    tags: backendTx.tags || [],
    currency: (backendTx.currency || 'INR') as any,
    created_at: backendTx.created_at || '',
    // Store full backend object for details view
    ...(backendTx.tax_amount && { tax_amount: parseFloat(backendTx.tax_amount) }),
    ...(backendTx.created_by && { created_by: backendTx.created_by }),
    ...(backendTx.created_by_user && { created_by_user: backendTx.created_by_user }),
    ...(backendTx.from_account && { from_account: backendTx.from_account }),
    // Always preserve to_account object for TRANSFER transactions, even if null
    ...(backendTx.transaction_type === 'TRANSFER' || backendTx.to_account ? { to_account: backendTx.to_account || {} } : {}),
    ...(backendTx.customer && { customer: backendTx.customer }),
  } as any;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>(mockTransactions);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reconciliationFilter, setReconciliationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistory | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  
  // Load transactions from backend
  useEffect(() => {
    loadTransactions();
  }, [directionFilter, statusFilter, dateFrom, dateTo]);
  
  const loadTransactions = async () => {
      setLoading(true);
    try {
      const params = new URLSearchParams({
        include_details: 'true',
        page: '1',
        limit: '100',
        from_date: dateFrom,
        to_date: dateTo,
        status: statusFilter,
        direction: directionFilter
      });
      
      console.log('Loading transaction history with params:', params.toString());
      
      const response = await apiRequest<{ success: boolean; data: { transactions: any[] } }>(
        `/finance/transactions?${params.toString()}`
      );
      
      console.log('Transaction history response:', response);
      
      if (response.success && response.data?.transactions) {
        const mapped = response.data.transactions.map(mapBackendToHistory);
        console.log('Mapped transaction history:', mapped.length);
        setTransactions(mapped);
      } else {
        console.log('No transactions in response, using mock data');
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchTerm === '' ||
      txn.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transaction_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.counterparty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDirection = directionFilter === 'all' || txn.transaction_direction === directionFilter;
    const matchesStatus = statusFilter === 'all' || txn.transaction_status === statusFilter;
    const matchesReconciliation = reconciliationFilter === 'all' || txn.reconciliation_status === reconciliationFilter;

    return matchesSearch && matchesDirection && matchesStatus && matchesReconciliation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalIn = transactions
    .filter((t) => t.transaction_direction === 'IN')
    .reduce((sum, t) => sum + t.transaction_amount, 0);
  const totalOut = transactions
    .filter((t) => t.transaction_direction === 'OUT')
    .reduce((sum, t) => sum + t.transaction_amount, 0);
  const pendingApprovals = transactions.filter((t) => t.approval_required && t.transaction_status === 'PENDING').length;
  const reconciledCount = transactions.filter((t) => t.reconciliation_status === 'RECONCILED').length;

  const columns: TableColumn<TransactionHistory>[] = [
    {
      key: 'transaction_number',
      header: 'Transaction #',
      render: (row) => (
        <div className="font-medium text-slate-900">
          <div className="text-xs">{row.transaction_number}</div>
          {row.reference_number && (
            <div className="text-[10px] text-slate-500">Ref: {row.reference_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'transaction_date',
      header: 'Date',
      render: (row) => (
        <div className="text-xs text-slate-900">
          {new Date(row.transaction_date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'transaction_direction',
      header: 'Type',
      render: (row) => (
        <div>
          <Badge
            tone={
              row.transaction_direction === 'IN'
                ? 'success'
                : row.transaction_direction === 'OUT'
                ? 'danger'
                : 'brand'
            }
          >
            {row.transaction_direction}
          </Badge>
          <div className="text-[10px] text-slate-500 mt-1">{row.transaction_type}</div>
        </div>
      )
    },
    {
      key: 'source_account_name',
      header: 'From Account',
      render: (row) => (
        <div className="text-xs text-slate-900">
          {row.source_account_name || <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'destination_account_name',
      header: 'To Account',
      render: (row) => (
        <div className="text-xs text-slate-900">
          {row.destination_account_name || <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'counterparty_name',
      header: 'Customer/Vendor',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.counterparty_name || <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'category_name',
      header: 'Category',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.category_name || <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'transaction_amount',
      header: 'Amount',
      render: (row) => {
        const taxAmount = (row as any).tax_amount || 0;
        const netAmount = row.transaction_amount - taxAmount;
        return (
          <div className="text-right">
            <div className={`text-xs font-semibold ${
              row.transaction_direction === 'IN' ? 'text-emerald-600' : row.transaction_direction === 'OUT' ? 'text-red-600' : 'text-slate-900'
            }`}>
              {row.transaction_direction === 'OUT' ? '-' : ''}
              {row.currency} {row.transaction_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {taxAmount > 0 && (
              <div className="text-[10px] text-slate-500">
                Tax: {row.currency} {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            {taxAmount > 0 && (
              <div className="text-[10px] text-slate-600 font-medium">
                Net: {row.currency} {netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'payment_method',
      header: 'Payment Method',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.payment_method ? row.payment_method.replace(/_/g, ' ') : <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'transaction_status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.transaction_status === 'POSTED' || row.transaction_status === 'RECONCILED'
              ? 'success'
              : row.transaction_status === 'APPROVED'
              ? 'brand'
              : row.transaction_status === 'PENDING' || row.transaction_status === 'DRAFT'
              ? 'warning'
              : 'neutral'
          }
        >
          {row.transaction_status}
        </Badge>
      )
    },
    {
      key: 'reconciliation_status',
      header: 'Reconciliation',
      render: (row) => (
        <Badge
          tone={
            row.reconciliation_status === 'RECONCILED'
              ? 'success'
              : row.reconciliation_status === 'PENDING'
              ? 'warning'
              : row.reconciliation_status === 'DISCREPANCY'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.reconciliation_status}
        </Badge>
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
              setSelectedTransaction(row);
              setDetailsModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            View Details
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading transactions..." size="md" variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Transaction History</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            View and manage all financial transactions with detailed tracking and reconciliation
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inflow"
          value={`₹${totalIn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="up"
        />
        <StatCard
          label="Total Outflow"
          value={`₹${totalOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="down"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals.toString()}
        />
        <StatCard
          label="Reconciled"
          value={reconciledCount.toString()}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder="Search by transaction #, title, counterparty..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Direction
              </label>
              <Select
                value={directionFilter}
                onChange={(e) => {
                  setDirectionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Directions</option>
                <option value="IN">Inflow</option>
                <option value="OUT">Outflow</option>
                <option value="TRANSFER">Transfer</option>
              </Select>
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
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reconciliation
              </label>
              <Select
                value={reconciliationFilter}
                onChange={(e) => {
                  setReconciliationFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All</option>
                <option value="PENDING">Pending</option>
                <option value="RECONCILED">Reconciled</option>
                <option value="DISCREPANCY">Discrepancy</option>
                <option value="NOT_REQUIRED">Not Required</option>
              </Select>
                          </div>
          </div>
        </div>

        {/* Table */}
        {paginatedTransactions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No transactions found"
              description="No transactions match your current filters"
            />
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

      {/* Transaction Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        title="Transaction Details"
      >
        {selectedTransaction && (() => {
          const tx = selectedTransaction as any;
          const taxAmount = tx.tax_amount || 0;
          const netAmount = selectedTransaction.transaction_amount - taxAmount;
          const fromAccount = tx.from_account || {};
          const toAccount = tx.to_account || {};
          const customer = tx.customer || {};
          const createdByUser = tx.created_by_user || {};
          
          return (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Transaction #:</span>
                    <div className="font-medium text-slate-900">{selectedTransaction.transaction_number}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Reference Number:</span>
                    <div className="font-medium text-slate-900">{selectedTransaction.reference_number || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>
                    <div className="font-medium text-slate-900">{new Date(selectedTransaction.transaction_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <div>
                      <Badge tone={selectedTransaction.transaction_direction === 'IN' ? 'success' : selectedTransaction.transaction_direction === 'OUT' ? 'danger' : 'brand'}>
                        {selectedTransaction.transaction_type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <div>
                      <Badge tone={selectedTransaction.transaction_status === 'POSTED' || selectedTransaction.transaction_status === 'RECONCILED' ? 'success' : selectedTransaction.transaction_status === 'APPROVED' ? 'brand' : 'warning'}>
                        {selectedTransaction.transaction_status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Category:</span>
                    <div className="font-medium text-slate-900">{selectedTransaction.category_name || '—'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Description:</span>
                    <div className="text-slate-900">{selectedTransaction.transaction_description || selectedTransaction.transaction_title || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Amount Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Gross Amount:</span>
                    <div className={`font-semibold text-slate-900 ${
                      selectedTransaction.transaction_direction === 'IN' ? 'text-emerald-600' : selectedTransaction.transaction_direction === 'OUT' ? 'text-red-600' : ''
                    }`}>
                      {selectedTransaction.transaction_direction === 'OUT' ? '-' : ''}
                      {selectedTransaction.currency} {selectedTransaction.transaction_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  {taxAmount > 0 && (
                    <>
                      <div>
                        <span className="text-slate-500">Tax Amount:</span>
                        <div className="font-medium text-slate-900">
                          {selectedTransaction.currency} {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Net Amount:</span>
                        <div className="font-semibold text-slate-900">
                          {selectedTransaction.currency} {netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-slate-500">Currency:</span>
                    <div className="font-medium text-slate-900">{selectedTransaction.currency}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Method:</span>
                    <div className="font-medium text-slate-900">
                      {selectedTransaction.payment_method ? selectedTransaction.payment_method.replace(/_/g, ' ') : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* From Account */}
                  {selectedTransaction.source_account_name && (
                    <div>
                      <span className="text-slate-500">From Account:</span>
                      <div className="font-medium text-slate-900">{selectedTransaction.source_account_name}</div>
                      {fromAccount.account_code && (
                        <div className="text-[10px] text-slate-500">Code: {fromAccount.account_code}</div>
                      )}
                      {fromAccount.account_type && (
                        <div className="text-[10px] text-slate-500">Type: {fromAccount.account_type}</div>
                      )}
                      {selectedTransaction.source_account_id && (
                        <div className="text-[10px] text-slate-500">ID: {selectedTransaction.source_account_id}</div>
                      )}
                      {fromAccount.currency && (
                        <div className="text-[10px] text-slate-500">Currency: {fromAccount.currency}</div>
                      )}
                      {fromAccount.is_active !== undefined && (
                        <div className="text-[10px] text-slate-500">
                          Status: {fromAccount.is_active ? 'Active' : 'Inactive'}
                        </div>
                      )}
                    </div>
                  )}
                  {/* To Account - Always show for TRANSFER transactions */}
                  {selectedTransaction.transaction_type === 'TRANSFER' && (
                    <div>
                      <span className="text-slate-500">To Account:</span>
                      {selectedTransaction.destination_account_name || toAccount.account_name ? (
                        <>
                          <div className="font-medium text-slate-900">
                            {selectedTransaction.destination_account_name || toAccount.account_name}
                          </div>
                          {toAccount.account_code && (
                            <div className="text-[10px] text-slate-500">Code: {toAccount.account_code}</div>
                          )}
                          {toAccount.account_type && (
                            <div className="text-[10px] text-slate-500">Type: {toAccount.account_type}</div>
                          )}
                          {(selectedTransaction.destination_account_id || toAccount.account_id) && (
                            <div className="text-[10px] text-slate-500">ID: {selectedTransaction.destination_account_id || toAccount.account_id}</div>
                          )}
                          {toAccount.currency && (
                            <div className="text-[10px] text-slate-500">Currency: {toAccount.currency}</div>
                          )}
                          {toAccount.is_active !== undefined && toAccount.is_active !== null && (
                            <div className="text-[10px] text-slate-500">
                              Status: {toAccount.is_active ? 'Active' : 'Inactive'}
                            </div>
                          )}
                        </>
                      ) : (selectedTransaction.destination_account_id || toAccount.account_id) ? (
                        <>
                          <div className="font-medium text-slate-900">
                            Account ID: {selectedTransaction.destination_account_id || toAccount.account_id}
                          </div>
                          {toAccount.account_code && (
                            <div className="text-[10px] text-slate-500">Code: {toAccount.account_code}</div>
                          )}
                          {toAccount.account_type && (
                            <div className="text-[10px] text-slate-500">Type: {toAccount.account_type}</div>
                          )}
                          {toAccount.currency && (
                            <div className="text-[10px] text-slate-500">Currency: {toAccount.currency}</div>
                          )}
                          {toAccount.is_active !== undefined && toAccount.is_active !== null && (
                            <div className="text-[10px] text-slate-500">
                              Status: {toAccount.is_active ? 'Active' : 'Inactive'}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-400 italic">To account details not available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer/Vendor Information */}
              {selectedTransaction.counterparty_name && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                    Customer/Vendor Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Name:</span>
                      <div className="font-medium text-slate-900">{selectedTransaction.counterparty_name}</div>
                    </div>
                    {customer.id && (
                      <div>
                        <span className="text-slate-500">Customer ID:</span>
                        <div className="font-medium text-slate-900">{customer.id}</div>
                      </div>
                    )}
                    {customer.customer_number && (
                      <div>
                        <span className="text-slate-500">Customer Number:</span>
                        <div className="font-medium text-slate-900">{customer.customer_number}</div>
                      </div>
                    )}
                    {customer.email && (
                      <div>
                        <span className="text-slate-500">Email:</span>
                        <div className="font-medium text-slate-900">{customer.email}</div>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="text-slate-500">Phone:</span>
                        <div className="font-medium text-slate-900">{customer.phone}</div>
                      </div>
                    )}
                    {customer.company_name && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Company:</span>
                        <div className="font-medium text-slate-900">{customer.company_name}</div>
                      </div>
                    )}
                    {selectedTransaction.counterparty_details && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Details:</span>
                        <div className="text-slate-900">{selectedTransaction.counterparty_details}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Information */}
              {selectedTransaction.approval_required && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                    Approval Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {selectedTransaction.approved_by_name && (
                      <>
                        <div>
                          <span className="text-slate-500">Approved By:</span>
                          <div className="font-medium text-slate-900">{selectedTransaction.approved_by_name}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Approval Date:</span>
                          <div className="font-medium text-slate-900">
                            {selectedTransaction.approval_datetime ? new Date(selectedTransaction.approval_datetime).toLocaleString() : '—'}
                          </div>
                        </div>
                        {selectedTransaction.approval_comments && (
                          <div className="col-span-2">
                            <span className="text-slate-500">Comments:</span>
                            <div className="text-slate-900">{selectedTransaction.approval_comments}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Reconciliation Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Reconciliation
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <div>
                      <Badge tone={selectedTransaction.reconciliation_status === 'RECONCILED' ? 'success' : selectedTransaction.reconciliation_status === 'PENDING' ? 'warning' : 'neutral'}>
                        {selectedTransaction.reconciliation_status}
                      </Badge>
                    </div>
                  </div>
                  {selectedTransaction.reconciled_by_name && (
                    <>
                      <div>
                        <span className="text-slate-500">Reconciled By:</span>
                        <div className="font-medium text-slate-900">{selectedTransaction.reconciled_by_name}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Reconciliation Date:</span>
                        <div className="font-medium text-slate-900">
                          {selectedTransaction.reconciliation_date ? new Date(selectedTransaction.reconciliation_date).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Created Information */}
              {createdByUser.full_name || createdByUser.email || tx.created_by && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                    Created Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {createdByUser.full_name && (
                      <div>
                        <span className="text-slate-500">Created By:</span>
                        <div className="font-medium text-slate-900">{createdByUser.full_name}</div>
                      </div>
                    )}
                    {createdByUser.email && (
                      <div>
                        <span className="text-slate-500">Email:</span>
                        <div className="font-medium text-slate-900">{createdByUser.email}</div>
                      </div>
                    )}
                    {selectedTransaction.created_at && (
                      <div>
                        <span className="text-slate-500">Created At:</span>
                        <div className="font-medium text-slate-900">
                          {new Date(selectedTransaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
