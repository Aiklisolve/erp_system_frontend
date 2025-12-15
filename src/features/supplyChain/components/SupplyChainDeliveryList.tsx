import { useState } from 'react';
import { useSupplyChainDeliveries } from '../hooks/useSupplyChainDeliveries';
import { useToast } from '../../../hooks/useToast';
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
import type { SupplyChainDelivery } from '../types';
import { SupplyChainDeliveryForm } from './SupplyChainDeliveryForm';

export function SupplyChainDeliveryList() {
  const { deliveries, loading, create, update, remove, refresh, metrics } = useSupplyChainDeliveries();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_transit' | 'received' | 'delayed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<SupplyChainDelivery | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formLoading, setFormLoading] = useState(false);

  // Filter deliveries based on search, filters, and active tab
  const filteredDeliveries = deliveries.filter((delivery) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      delivery.delivery_number.toLowerCase().includes(searchLower) ||
      (delivery.purchase_order_number?.toLowerCase() || '').includes(searchLower) ||
      (delivery.supplier_name?.toLowerCase() || '').includes(searchLower) ||
      (delivery.warehouse_name?.toLowerCase() || '').includes(searchLower) ||
      (delivery.tracking_number?.toLowerCase() || '').includes(searchLower) ||
      (delivery.invoice_number?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || delivery.delivery_status === statusFilter;
    const matchesQuality = qualityFilter === 'all' || delivery.quality_status === qualityFilter;
    const matchesPayment = paymentFilter === 'all' || delivery.payment_status === paymentFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && delivery.delivery_status === 'PENDING') ||
      (activeTab === 'in_transit' && delivery.delivery_status === 'IN_TRANSIT') ||
      (activeTab === 'received' && delivery.delivery_status === 'RECEIVED') ||
      (activeTab === 'delayed' && delivery.delivery_status === 'DELAYED');
    
    return matchesSearch && matchesStatus && matchesQuality && matchesPayment && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(deliveries.map((d) => d.delivery_status)));
  const qualityStatuses = Array.from(new Set(deliveries.map((d) => d.quality_status)));
  const paymentStatuses = Array.from(new Set(deliveries.map((d) => d.payment_status)));

  const columns: TableColumn<SupplyChainDelivery>[] = [
    {
      key: 'delivery_number',
      header: 'Delivery #',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.delivery_number}</div>
          {row.purchase_order_number && (
            <div className="text-[10px] text-slate-500">PO: {row.purchase_order_number}</div>
          )}
        </div>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (row) => (
        <div className="text-slate-900">
          {row.supplier_name || `Supplier #${row.supplier_id}`}
        </div>
      ),
    },
    {
      key: 'warehouse_name',
      header: 'Warehouse',
      render: (row) => (
        <div className="text-slate-600">
          {row.warehouse_name || (row.warehouse_id ? `WH-${row.warehouse_id}` : '-')}
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => (
        <div className="space-y-0.5">
          {row.expected_delivery_date && (
            <div className="text-xs text-slate-600">
              Exp: {new Date(row.expected_delivery_date).toLocaleDateString()}
            </div>
          )}
          {row.delivery_date && (
            <div className="text-xs text-slate-900">
              Act: {new Date(row.delivery_date).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'delivery_status',
      header: 'Status',
      render: (row) => {
        const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'brand' | 'neutral'> = {
          RECEIVED: 'success',
          IN_TRANSIT: 'brand',
          PARTIALLY_RECEIVED: 'warning',
          PENDING: 'neutral',
          DELAYED: 'danger',
          CANCELLED: 'danger',
        };
        return (
          <Badge tone={statusColors[row.delivery_status] || 'neutral'}>
            {row.delivery_status.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs text-slate-900">
            Ord: {row.ordered_quantity} | Rec: {row.received_quantity}
          </div>
          {(row.accepted_quantity > 0 || row.rejected_quantity > 0) && (
            <div className="text-[10px] text-slate-500">
              Acc: {row.accepted_quantity} | Rej: {row.rejected_quantity}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'quality_status',
      header: 'Quality',
      render: (row) => {
        const qualityColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
          PASSED: 'success',
          PARTIAL: 'warning',
          FAILED: 'danger',
          PENDING_INSPECTION: 'neutral',
        };
        return (
          <div className="space-y-0.5">
            <Badge tone={qualityColors[row.quality_status] || 'neutral'}>
              {row.quality_status.replace(/_/g, ' ')}
            </Badge>
            {row.quality_score != null && !isNaN(Number(row.quality_score)) && (
              <div className="text-[10px] text-slate-500">
                Score: {Number(row.quality_score).toFixed(1)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (row) => {
        const paymentColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
          PAID: 'success',
          PARTIAL: 'warning',
          OVERDUE: 'danger',
          PENDING: 'neutral',
        };
        return (
          <div className="space-y-0.5">
            <Badge tone={paymentColors[row.payment_status] || 'neutral'}>
              {row.payment_status}
            </Badge>
            {row.invoice_amount && (
              <div className="text-[10px] text-slate-500">
                ${row.invoice_amount.toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'tracking_number',
      header: 'Tracking',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.tracking_number || '-'}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingDelivery(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>) => {
    if (formLoading) return; // Prevent double submission
    setFormLoading(true);
    try {
      if (editingDelivery) {
        await update(String(editingDelivery.id), data);
        showToast('success', 'Delivery Updated', `Delivery "${data.delivery_number}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Delivery Created', `Delivery "${data.delivery_number}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingDelivery(null);
      await refresh(); // Refresh the list to get updated data
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save delivery. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (delivery: SupplyChainDelivery) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await remove(String(delivery.id));
        showToast('success', 'Delivery Deleted', `Delivery "${delivery.delivery_number}" has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete delivery. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Supply Chain Deliveries
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track deliveries, monitor quality, manage payments, and oversee supplier performance.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingDelivery(null);
            setModalOpen(true);
          }}
        >
          New Delivery
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="Total Deliveries"
          value={metrics.total.toString()}
          helper="All deliveries in system."
          variant="teal"
        />
        <StatCard
          label="Received"
          value={metrics.received.toString()}
          helper="Successfully received."
          variant="blue"
        />
        <StatCard
          label="Pending"
          value={metrics.pending.toString()}
          helper="Pending or in transit."
          variant="yellow"
        />
        <StatCard
          label="Delayed"
          value={metrics.delayed.toString()}
          helper="Delayed deliveries."
          variant="purple"
        />
        <StatCard
          label="Paid"
          value={metrics.paid.toString()}
          helper="Invoices paid."
          variant="teal"
        />
        <StatCard
          label="Quality Passed"
          value={metrics.qualityPassed.toString()}
          helper="Passed quality checks."
          variant="purple"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Deliveries' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'received', label: 'Received' },
            { id: 'delayed', label: 'Delayed' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'pending' | 'in_transit' | 'received' | 'delayed');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by delivery #, PO #, supplier, warehouse, tracking, invoice..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={qualityFilter}
            onChange={(e) => {
              setQualityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Quality</option>
            {qualityStatuses.map((quality) => (
              <option key={quality} value={quality}>
                {quality.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Payment</option>
            {paymentStatuses.map((payment) => (
              <option key={payment} value={payment}>
                {payment}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 sm:py-16">
            <LoadingState label="Loading deliveries..." size="md" variant="default" />
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <EmptyState
            title="No deliveries found"
            description={
              searchTerm || statusFilter !== 'all' || qualityFilter !== 'all' || paymentFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first delivery to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedDeliveries}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Page size selector */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>

                {/* Center: Page numbers */}
                <div className="flex-1 flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>

                {/* Right: Showing info */}
                <div className="text-xs text-slate-600 whitespace-nowrap">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredDeliveries.length)}</span> of <span className="font-medium text-slate-900">{filteredDeliveries.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingDelivery ? 'Edit Delivery' : 'New Delivery'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDelivery(null);
        }}
        hideCloseButton
      >
        <SupplyChainDeliveryForm
          initial={editingDelivery || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingDelivery(null);
          }}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
}

