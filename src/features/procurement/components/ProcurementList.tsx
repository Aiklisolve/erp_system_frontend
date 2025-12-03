import { useState } from 'react';
import { useProcurement } from '../hooks/useProcurement';
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
import type { PurchaseOrder } from '../types';
import { ProcurementForm } from './ProcurementForm';

export function ProcurementList() {
  const { orders, loading, create, update, remove, metrics } = useProcurement();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'pending' | 'approved' | 'sent' | 'received'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter orders based on active tab
  const filteredByTab = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return order.status === 'DRAFT';
    if (activeTab === 'pending') return order.status === 'PENDING_APPROVAL';
    if (activeTab === 'approved') return order.status === 'APPROVED';
    if (activeTab === 'sent') return order.status === 'SENT';
    if (activeTab === 'received') return order.status === 'RECEIVED' || order.status === 'PARTIALLY_RECEIVED';
    return true;
  });

  // Apply search and filters
  const filteredOrders = filteredByTab.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.requisition_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingApprovals = orders.filter((o) => o.status === 'PENDING_APPROVAL').length;
  const sentOrders = orders.filter((o) => o.status === 'SENT').length;
  const receivedOrders = orders.filter((o) => o.status === 'RECEIVED').length;

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'draft', label: 'Draft', count: orders.filter((o) => o.status === 'DRAFT').length },
    { id: 'pending', label: 'Pending Approval', count: pendingApprovals },
    { id: 'approved', label: 'Approved', count: orders.filter((o) => o.status === 'APPROVED').length },
    { id: 'sent', label: 'Sent', count: sentOrders },
    { id: 'received', label: 'Received', count: orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PARTIALLY_RECEIVED').length }
  ];

  const columns: TableColumn<PurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'PO Number',
      render: (row) => (
        <div className="font-medium text-slate-900">
          {row.po_number}
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
          {row.expected_delivery_date && (
            <div className="text-[10px] text-slate-500">
              Exp: {new Date(row.expected_delivery_date).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.supplier}</div>
          {row.supplier_contact_person && (
            <div className="text-[10px] text-slate-500">{row.supplier_contact_person}</div>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            row.priority === 'URGENT' ? 'bg-red-500' :
            row.priority === 'HIGH' ? 'bg-orange-500' :
            row.priority === 'MEDIUM' ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-xs text-slate-600">{row.priority}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'RECEIVED' || row.status === 'CLOSED'
              ? 'success'
              : row.status === 'APPROVED' || row.status === 'SENT'
              ? 'brand'
              : row.status === 'PENDING_APPROVAL'
              ? 'warning'
              : row.status === 'CANCELLED'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.status.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (row) => (
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-900">
            {row.currency} {row.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {row.items_count && (
            <div className="text-[10px] text-slate-500">{row.items_count} items</div>
          )}
        </div>
      )
    },
    {
      key: 'receiving',
      header: 'Receiving',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.received_quantity !== undefined && row.total_quantity ? (
            <div>
              <div>{row.received_quantity} / {row.total_quantity}</div>
              <div className="text-[10px] text-slate-500">
                {((row.received_quantity / row.total_quantity) * 100).toFixed(0)}%
              </div>
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
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
              setEditingOrder(row);
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

  const handleCreate = async (data: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await create(data);
      setModalOpen(false);
      setEditingOrder(null);
      showToast('success', 'Purchase Order Created', `PO ${data.po_number} has been created successfully.`);
    } catch (error) {
      showToast('error', 'Creation Failed', 'Failed to create purchase order. Please try again.');
    }
  };

  const handleUpdate = async (data: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingOrder) {
      try {
        await update(editingOrder.id, data);
        setModalOpen(false);
        setEditingOrder(null);
        showToast('success', 'Purchase Order Updated', `PO ${data.po_number} has been updated successfully.`);
      } catch (error) {
        showToast('error', 'Update Failed', 'Failed to update purchase order. Please try again.');
      }
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await remove(order.id);
        showToast('success', 'Purchase Order Deleted', `PO ${order.po_number} has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete purchase order. Please try again.');
      }
    }
  };

  if (loading) {
    return <LoadingState label="Loading purchase orders..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Procurement</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Manage purchase orders, supplier relationships, and procurement workflows
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingOrder(null);
            setModalOpen(true);
          }}
        >
          + New Purchase Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Purchase Orders"
          value={orders.length.toString()}
        />
        <StatCard
          label="Total Amount"
          value={`$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals.toString()}
        />
        <StatCard
          label="Sent to Suppliers"
          value={sentOrders.toString()}
        />
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs.map((tab) => ({
          id: tab.id,
          label: `${tab.label} (${tab.count})`
        }))}
        activeId={activeTab}
        onChange={(id) => {
          setActiveTab(id as any);
          setCurrentPage(1);
        }}
      />

      {/* Filters */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Search
              </label>
              <Input
                placeholder="Search by PO #, supplier, reference..."
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
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="SENT">Sent</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        {paginatedOrders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No purchase orders found"
              description="Create your first purchase order or adjust your filters"
            />
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingOrder(null);
                  setModalOpen(true);
                }}
              >
                + New Purchase Order
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table
              data={paginatedOrders}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} purchase orders
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
          setEditingOrder(null);
        }}
        title={editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'}
      >
        <ProcurementForm
          initial={editingOrder || undefined}
          onSubmit={editingOrder ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditingOrder(null);
          }}
        />
      </Modal>
    </div>
  );
}
