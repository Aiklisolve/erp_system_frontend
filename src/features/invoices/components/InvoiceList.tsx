import { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useToast } from '../../../hooks/useToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Invoice, InvoiceStatus, InvoiceType } from '../types';
import { InvoiceForm } from './InvoiceForm';

export function InvoiceList() {
  const { invoices, loading, create, update, remove, send, markPaid, downloadPDF, refresh } = useInvoices();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.customer_name.toLowerCase().includes(searchLower) ||
      invoice.customer_email?.toLowerCase().includes(searchLower) ||
      invoice.po_number?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.invoice_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const metrics = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === 'DRAFT').length,
    pending: invoices.filter((i) => i.status === 'PENDING').length,
    paid: invoices.filter((i) => i.status === 'PAID').length,
    overdue: invoices.filter((i) => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paidAmount: invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
    outstandingAmount: invoices.reduce((sum, i) => sum + (i.balance_amount || i.total_amount - (i.paid_amount || 0)), 0),
  };

  const handleSubmit = async (invoiceData: Partial<Invoice>) => {
    try {
      if (editingInvoice) {
        await update(editingInvoice.id, invoiceData);
        showToast('success', 'Invoice Updated', 'Invoice has been updated successfully.');
      } else {
        await create(invoiceData);
        showToast('success', 'Invoice Created', 'Invoice has been created successfully.');
      }
      setModalOpen(false);
      setEditingInvoice(null);
      await refresh();
    } catch (error) {
      showToast('error', 'Error', 'Failed to save invoice. Please try again.');
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    
    try {
      await remove(invoiceToDelete.id);
      showToast('success', 'Invoice Deleted', 'Invoice has been deleted successfully.');
      await refresh();
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.error || 
                          '';
      
      // Check if error message indicates invoice cannot be deleted
      if (errorMessage.includes('Only DRAFT or CANCELLED invoices can be deleted') || 
          errorMessage.toLowerCase().includes('cannot be deleted')) {
        const status = invoiceToDelete.status.replace(/_/g, ' ');
        showToast('error', 'Cannot Delete Invoice', 
          `This invoice cannot be deleted. Current status: ${status}. Only DRAFT or CANCELLED invoices can be deleted.`);
      } else {
        showToast('error', 'Error', errorMessage || 'Failed to delete invoice. Please try again.');
      }
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleSend = async (invoice: Invoice) => {
    try {
      await send(invoice.id);
      showToast('success', 'Invoice Sent', 'Invoice has been sent successfully.');
      await refresh();
    } catch (error) {
      showToast('error', 'Error', 'Failed to send invoice. Please try again.');
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      showToast('info', 'Downloading...', 'Preparing invoice PDF...');
      const { blob, filename } = await downloadPDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      showToast('success', 'Download Started', `Invoice PDF "${filename}" is downloading...`);
    } catch (error) {
      showToast('error', 'Download Failed', 'Failed to download invoice PDF. Please try again.');
    }
  };

  const statusColors: Record<InvoiceStatus, string> = {
    DRAFT: 'bg-slate-50 text-slate-700',
    PENDING: 'bg-yellow-50 text-yellow-700',
    SENT: 'bg-blue-50 text-blue-700',
    PAID: 'bg-green-50 text-green-700',
    PARTIALLY_PAID: 'bg-amber-50 text-amber-700',
    OVERDUE: 'bg-red-50 text-red-700',
    CANCELLED: 'bg-gray-50 text-gray-700',
    REFUNDED: 'bg-purple-50 text-purple-700',
  };

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.invoice_number}</div>
          {row.invoice_code && (
            <div className="text-[10px] text-slate-500">{row.invoice_code}</div>
          )}
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.customer_name}</div>
          {row.customer_email && (
            <div className="text-[10px] text-slate-500">{row.customer_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'invoice_date',
      header: 'Date',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{new Date(row.invoice_date).toLocaleDateString()}</div>
          <div className="text-[10px] text-slate-500">Due: {new Date(row.due_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">
            {row.currency} {row.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {row.paid_amount && row.paid_amount > 0 && (
            <div className="text-[10px] text-green-600">
              Paid: {row.currency} {row.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'PAID'
            ? 'success'
            : row.status === 'OVERDUE'
            ? 'danger'
            : row.status === 'PARTIALLY_PAID'
            ? 'warning'
            : row.status === 'SENT'
            ? 'brand'
            : row.status === 'PENDING'
            ? 'warning'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadPDF(row)}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingInvoice(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            View
          </button>
          {row.status === 'DRAFT' && (
            <button
              type="button"
              onClick={() => void handleSend(row)}
              className="text-[11px] text-green-600 hover:text-green-800"
            >
              Send
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDeleteClick(row)}
            className="text-[11px] text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Generate, manage, and track invoices for sales, purchases, and services.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingInvoice(null);
            setModalOpen(true);
          }}
        >
          Create Invoice
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Invoices"
          value={metrics.total.toString()}
          variant="indigo"
        />
        <StatCard
          label="Draft"
          value={metrics.draft.toString()}
          variant="neutral"
        />
        <StatCard
          label="Pending"
          value={metrics.pending.toString()}
          variant="yellow"
        />
        <StatCard
          label="Paid"
          value={metrics.paid.toString()}
          variant="green"
        />
        <StatCard
          label="Overdue"
          value={metrics.overdue.toString()}
          variant="red"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[10px] text-slate-600 mb-1">Total Amount</div>
          <div className="text-lg font-semibold text-slate-900">
            ₹{metrics.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] text-slate-600 mb-1">Paid Amount</div>
          <div className="text-lg font-semibold text-green-600">
            ₹{metrics.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] text-slate-600 mb-1">Outstanding</div>
          <div className="text-lg font-semibold text-red-600">
            ₹{metrics.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by invoice number, customer name, email, or PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Types</option>
            <option value="SALES">Sales</option>
            <option value="PURCHASE">Purchase</option>
            <option value="SERVICE">Service</option>
            <option value="PRODUCT">Product</option>
            <option value="RECURRING">Recurring</option>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 sm:py-16">
            <LoadingState label="Loading invoices..." size="md" variant="default" />
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Create your first invoice to get started."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedInvoices}
                getRowKey={(row) => row.id}
              />
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-600 whitespace-nowrap">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to{' '}
                  <span className="font-medium text-slate-900">
                    {Math.min(startIndex + paginatedInvoices.length, filteredInvoices.length)}
                  </span>{' '}
                  of <span className="font-medium text-slate-900">{filteredInvoices.length}</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>
                <div className="w-24" />
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingInvoice(null);
        }}
        hideCloseButton
      >
        <InvoiceForm
          initial={editingInvoice || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingInvoice(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoice_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setInvoiceToDelete(null);
        }}
      />
    </div>
  );
}

