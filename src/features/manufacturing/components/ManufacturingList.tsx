import { useState } from 'react';
import { useManufacturing } from '../hooks/useManufacturing';
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
import type { ProductionOrder } from '../types';
import { SimpleProductionOrderForm } from './SimpleProductionOrderForm';

export function ManufacturingList() {
  const { orders, loading, create, update, remove, metrics } = useManufacturing();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'planned' | 'in_progress' | 'completed' | 'on_hold'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter orders based on active tab
  const filteredByTab = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'planned') return order.status === 'PLANNED' || order.status === 'SCHEDULED' || order.status === 'DRAFT';
    if (activeTab === 'in_progress') return order.status === 'IN_PROGRESS' || order.status === 'RELEASED';
    if (activeTab === 'completed') return order.status === 'COMPLETED' || order.status === 'CLOSED';
    // On Hold tab shows both ON_HOLD and CANCELLED statuses
    if (activeTab === 'on_hold') {
      const status = order.status?.toUpperCase();
      return status === 'ON_HOLD' || 
             status === 'CANCELLED' || 
             status === 'CANCELED' ||  // Handle both spellings
             status === 'HOLD' ||
             status === 'PAUSED';
    }
    return true;
  });

  // Apply search and filters
  const filteredOrders = filteredByTab.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.production_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const totalProduction = orders.reduce((sum, order) => sum + (order.planned_qty || 0), 0);
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'RELEASED').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalCost = orders.reduce((sum, order) => sum + (order.cost || 0), 0);
  const avgEfficiency = orders.filter(o => o.efficiency_percentage).reduce((sum, o) => sum + (o.efficiency_percentage || 0), 0) / orders.filter(o => o.efficiency_percentage).length || 0;

  // Calculate on hold count (includes CANCELLED, ON_HOLD, HOLD, PAUSED)
  const onHoldCount = orders.filter((o) => {
    const status = o.status?.toUpperCase();
    return status === 'ON_HOLD' || status === 'CANCELLED' || status === 'CANCELED' || status === 'HOLD' || status === 'PAUSED';
  }).length;

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'planned', label: 'Planned', count: orders.filter((o) => o.status === 'PLANNED' || o.status === 'SCHEDULED' || o.status === 'DRAFT').length },
    { id: 'in_progress', label: 'In Progress', count: inProgressCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'on_hold', label: 'On Hold / Cancelled', count: onHoldCount }
  ];

  const columns: TableColumn<ProductionOrder>[] = [
    {
      key: 'production_order_number',
      header: 'Production Order #',
      render: (row) => (
        <div className="font-medium text-slate-900">
          {row.production_order_number}
          {row.work_order_number && (
            <div className="text-[10px] text-slate-500">WO: {row.work_order_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (row) => (
        <div>
          <div className="text-xs text-slate-900">{new Date(row.start_date).toLocaleDateString()}</div>
          {row.end_date && (
            <div className="text-[10px] text-slate-500">End: {new Date(row.end_date).toLocaleDateString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-900">{row.product}</div>
          {row.product_code && (
            <div className="text-[10px] text-slate-500">{row.product_code}</div>
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
      render: (row) => {
        const status = row.status?.toUpperCase();
        return (
          <Badge
            tone={
              status === 'COMPLETED' || status === 'CLOSED'
                ? 'success'
                : status === 'IN_PROGRESS' || status === 'RELEASED'
                ? 'brand'
                : status === 'PLANNED' || status === 'SCHEDULED' || status === 'DRAFT'
                ? 'warning'
                : status === 'ON_HOLD' || status === 'HOLD' || status === 'PAUSED'
                ? 'warning'
                : status === 'CANCELLED' || status === 'CANCELED'
                ? 'danger'
                : 'neutral'
            }
          >
            {row.status ? row.status.replace(/_/g, ' ') : 'DRAFT'}
          </Badge>
        );
      }
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900">
            {row.produced_qty || 0} / {row.planned_qty} {row.unit}
          </div>
          {row.progress_percentage !== undefined && (
            <div className="text-[10px] text-slate-500">
              {row.progress_percentage.toFixed(0)}% complete
            </div>
          )}
        </div>
      )
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (row) => (
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-900">
            {row.currency || 'INR'} {(row.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {row.actual_cost !== undefined && 
           row.actual_cost !== null && 
           row.actual_cost > 0 &&
           row.actual_cost !== row.cost && (
            <div className="text-[10px] text-slate-500">
              Actual: {row.currency || 'INR'} {row.actual_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
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

  const handleCreate = async (data: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await create(data);
      setModalOpen(false);
      setEditingOrder(null);
      showToast('success', 'Production Order Created', `Order ${data.production_order_number} has been created successfully.`);
    } catch (error) {
      showToast('error', 'Creation Failed', 'Failed to create production order. Please try again.');
    }
  };

  const handleUpdate = async (data: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingOrder) {
      try {
        await update(editingOrder.id, data);
        setModalOpen(false);
        setEditingOrder(null);
        showToast('success', 'Production Order Updated', `Order ${data.production_order_number} has been updated successfully.`);
      } catch (error) {
        showToast('error', 'Update Failed', 'Failed to update production order. Please try again.');
      }
    }
  };

  const handleDelete = async (order: ProductionOrder) => {
    if (window.confirm('Are you sure you want to delete this production order?')) {
      try {
        await remove(order.id);
        showToast('success', 'Production Order Deleted', `Order ${order.production_order_number} has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete production order. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <LoadingState label="Loading production orders..." size="md" variant="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Manufacturing</h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1">
            Manage production orders, track manufacturing progress, and monitor shop floor operations
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
          + New Production Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Orders"
          value={orders.length.toString()}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount.toString()}
        />
        <StatCard
          label="Completed"
          value={completedCount.toString()}
        />
        <StatCard
          label="Total Cost"
          value={`₹${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        />
        <StatCard
          label="Avg Efficiency"
          value={`${avgEfficiency.toFixed(1)}%`}
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
                placeholder="Search by PO #, product, batch, customer..."
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
                <option value="PLANNED">Planned</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="RELEASED">Released</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
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
              title="No production orders found"
              description="Create your first production order or adjust your filters"
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
                + New Production Order
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
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium text-slate-900">{filteredOrders.length}</span>
                </div>
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
        title={editingOrder ? 'Edit Production Order' : 'New Production Order'}
        hideCloseButton
      >
        <SimpleProductionOrderForm
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
