import { useState, useEffect, FormEvent } from 'react';
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
import type { ReceivedPayment, PaymentMethod, Currency } from '../types';
import * as paymentsApi from '../api/financeApi';
import { SimpleReceivedPaymentForm } from './SimpleReceivedPaymentForm';
import { toast } from '../../../lib/toast';

type ReceivedPaymentFormProps = {
  initial?: Partial<ReceivedPayment>;
  onSubmit: (data: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

function ReceivedPaymentForm({ initial, onSubmit, onCancel }: ReceivedPaymentFormProps) {
  const [paymentNumber, setPaymentNumber] = useState(initial?.payment_number ?? '');
  const [paymentDate, setPaymentDate] = useState(initial?.payment_date ?? new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(initial?.customer_name ?? '');
  const [customerId, setCustomerId] = useState(initial?.customer_id ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? '');
  const [invoiceId, setInvoiceId] = useState(initial?.invoice_id ?? '');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.payment_method ?? 'BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [transactionId, setTransactionId] = useState(initial?.transaction_id ?? '');
  const [account, setAccount] = useState(initial?.account ?? '');
  const [status, setStatus] = useState<'PENDING' | 'RECEIVED' | 'CLEARED' | 'BOUNCED' | 'REFUNDED'>(initial?.status ?? 'RECEIVED');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [receivedBy, setReceivedBy] = useState(initial?.received_by ?? '');
  const [clearedDate, setClearedDate] = useState(initial?.cleared_date ?? '');

  // Auto-generate payment number if not provided
  useEffect(() => {
    if (!initial && !paymentNumber) {
      const prefix = 'PAY';
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setPaymentNumber(`${prefix}-${year}-${random}`);
    }
  }, [initial, paymentNumber]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const payload: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'> = {
      payment_number: paymentNumber,
      payment_date: paymentDate,
      customer_name: customerName,
      customer_id: customerId || undefined,
      invoice_number: invoiceNumber || undefined,
      invoice_id: invoiceId || undefined,
      amount: parseFloat(amount),
      currency,
      payment_method: paymentMethod,
      reference_number: referenceNumber || undefined,
      transaction_id: transactionId || undefined,
      account,
      status,
      notes: notes || undefined,
      received_by: receivedBy || undefined,
      cleared_date: clearedDate || undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              placeholder="PAY-2025-0001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)} required>
              <option value="PENDING">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="CLEARED">Cleared</option>
              <option value="BOUNCED">Bounced</option>
              <option value="REFUNDED">Refunded</option>
            </Select>
          </div>
          {status === 'CLEARED' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Cleared Date
              </label>
              <Input
                type="date"
                value={clearedDate}
                onChange={(e) => setClearedDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Customer Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Acme Corporation"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer ID
            </label>
            <Input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="CUST-001"
            />
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Invoice Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Invoice Number
            </label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-2025-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Invoice ID
            </label>
            <Input
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="inv-001"
            />
          </div>
        </div>
      </div>

      {/* Amount & Payment Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Amount & Payment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} required>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} required>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="WIRE_TRANSFER">Wire Transfer</option>
              <option value="ONLINE_PAYMENT">Online Payment</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Account <span className="text-red-500">*</span>
            </label>
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Bank Account - Main"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reference Number
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="REF-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Transaction ID
            </label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="TXN-BANK-001"
            />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Received By
            </label>
            <Input
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Sarah Johnson"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this payment"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}

export function ReceivedPayments() {
  const [payments, setPayments] = useState<ReceivedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ReceivedPayment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.listReceivedPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === '' ||
      payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalReceived = payments
    .filter((p) => p.status === 'RECEIVED' || p.status === 'CLEARED')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
  const clearedPayments = payments.filter((p) => p.status === 'CLEARED').length;
  const totalPayments = payments.length;

  const columns: TableColumn<ReceivedPayment>[] = [
    {
      key: 'payment_number',
      header: 'Payment #',
      render: (row) => (
        <div className="font-medium text-slate-900">
          {row.payment_number}
          {row.reference_number && (
            <div className="text-[10px] text-slate-500">Ref: {row.reference_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'payment_date',
      header: 'Date',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{new Date(row.payment_date).toLocaleDateString()}</div>
          {row.cleared_date && (
            <div className="text-[10px] text-slate-500">Cleared: {new Date(row.cleared_date).toLocaleDateString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.customer_name}</div>
          {row.customer_id && (
            <div className="text-[10px] text-slate-500">{row.customer_id}</div>
          )}
        </div>
      )
    },
    {
      key: 'invoice_number',
      header: 'Invoice',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.invoice_number || <span className="text-slate-400">—</span>}
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="text-right">
          <div className="text-xs font-semibold text-emerald-600">
            {row.currency} {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (row) => (
        <div className="text-xs text-slate-600">{row.payment_method.replace(/_/g, ' ')}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'CLEARED' || row.status === 'RECEIVED'
              ? 'success'
              : row.status === 'PENDING'
              ? 'warning'
              : 'danger'
          }
        >
          {row.status}
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
              setEditingPayment(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-light font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleCreate = async (data: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await paymentsApi.createReceivedPayment(data);
      toast.success('Payment recorded successfully!');
      setModalOpen(false);
      setEditingPayment(null);
      loadPayments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const handleUpdate = async (data: Omit<ReceivedPayment, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingPayment) {
      try {
        await paymentsApi.updateReceivedPayment(editingPayment.id, data);
        toast.success('Payment updated successfully!');
        setModalOpen(false);
        setEditingPayment(null);
        loadPayments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to update payment');
      }
    }
  };

  const handleDelete = async (payment: ReceivedPayment) => {
    if (window.confirm(`Are you sure you want to delete payment "${payment.payment_number}"?`)) {
      try {
        await paymentsApi.deleteReceivedPayment(payment.id);
        toast.success('Payment deleted successfully!');
        loadPayments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete payment');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading received payments..." size="md" variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Received Payments</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Track and manage customer payments received against invoices
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingPayment(null);
            setModalOpen(true);
          }}
        >
          + Record Payment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Received"
          value={`₹${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="up"
        />
        <StatCard
          label="Total Payments"
          value={totalPayments.toString()}
        />
        <StatCard
          label="Pending"
          value={pendingPayments.toString()}
        />
        <StatCard
          label="Cleared"
          value={clearedPayments.toString()}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder="Search by payment #, customer, invoice..."
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
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
                <option value="CLEARED">Cleared</option>
                <option value="BOUNCED">Bounced</option>
                <option value="REFUNDED">Refunded</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        {paginatedPayments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No payments found"
              description="Record your first payment or adjust your filters"
            />
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingPayment(null);
                  setModalOpen(true);
                }}
              >
                + Record Payment
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table
              data={paginatedPayments}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? 'Edit Payment' : 'Record Payment'}
      >
        <SimpleReceivedPaymentForm
          initial={editingPayment || undefined}
          onSubmit={editingPayment ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingPayment(null);
          }}
        />
      </Modal>
    </div>
  );
}
