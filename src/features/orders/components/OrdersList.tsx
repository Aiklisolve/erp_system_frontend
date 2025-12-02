import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
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
import type { SalesOrder } from '../types';
import { OrderForm } from './OrderForm';

export function OrdersList() {
  const { orders, loading, create, update, remove, refresh, metrics } = useOrders();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'shipped'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter orders based on search, status, and active tab
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.customer.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      (order.order_number && order.order_number.toLowerCase().includes(searchLower)) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchLower)) ||
      (order.customer_phone && order.customer_phone.includes(searchTerm)) ||
      (order.customer_po_number && order.customer_po_number.toLowerCase().includes(searchLower)) ||
      (order.invoice_number && order.invoice_number.toLowerCase().includes(searchLower)) ||
      (order.tracking_number && order.tracking_number.toLowerCase().includes(searchLower)) ||
      order.date.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && order.status === 'PENDING') ||
      (activeTab === 'confirmed' && order.status === 'CONFIRMED') ||
      (activeTab === 'shipped' && (order.status === 'SHIPPED' || order.status === 'DELIVERED'));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Get unique statuses for filter
  const statuses = Array.from(new Set(orders.map((order) => order.status)));

  const columns: TableColumn<SalesOrder>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      render: (row) => row.order_number || row.id,
    },
    { key: 'date', header: 'Date' },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.customer}</div>
          {row.contact_person && (
            <div className="text-[10px] text-slate-500">{row.contact_person}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'SHIPPED' || row.status === 'DELIVERED'
            ? 'success'
            : row.status === 'CANCELLED'
            ? 'danger'
            : 'warning';
        return <Badge tone={statusTone}>{row.status}</Badge>;
      },
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (row) => {
        if (!row.payment_status) return <span className="text-[11px] text-slate-400">-</span>;
        const paymentTone =
          row.payment_status === 'PAID'
            ? 'success'
            : row.payment_status === 'REFUNDED'
            ? 'danger'
            : row.payment_status === 'PARTIALLY_PAID'
            ? 'warning'
            : 'neutral';
        return (
          <Badge tone={paymentTone} className="text-[10px]">
            {row.payment_status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => {
        if (!row.priority) return <span className="text-[11px] text-slate-400">-</span>;
        const priorityColors = {
          LOW: 'text-slate-500',
          MEDIUM: 'text-blue-600',
          HIGH: 'text-amber-600',
          URGENT: 'text-red-600',
        };
        return (
          <span className={`text-[11px] font-medium ${priorityColors[row.priority] || 'text-slate-500'}`}>
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) =>
        row.total_amount.toLocaleString(undefined, {
          style: 'currency',
          currency: row.currency || 'USD',
        }),
    },
    {
      key: 'expected_delivery_date',
      header: 'Delivery',
      render: (row) => row.expected_delivery_date || <span className="text-[11px] text-slate-400">-</span>,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingOrder(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingOrder) {
      await update(editingOrder.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Order Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track sales orders from creation through shipment. Manage customer orders and fulfillment status.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingOrder(null);
            setModalOpen(true);
          }}
        >
          New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={orders.length.toString()}
          helper="All orders in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Pending Orders"
          value={metrics.pending.toString()}
          helper="Awaiting confirmation."
          trend={metrics.pending > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Confirmed Orders"
          value={metrics.confirmed.toString()}
          helper="Ready to be fulfilled."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Total Order Value"
          value={metrics.totalValue.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
          helper="Combined value of all orders."
          trend="up"
          variant="purple"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'shipped', label: 'Shipped/Delivered' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'pending' | 'confirmed' | 'shipped');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, customer, or date..."
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
                {status}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading orders..." />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description={
              searchTerm || statusFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first order to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedOrders}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Select
                  value={itemsPerPage.toString()}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-32"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </Select>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingOrder ? 'Edit Order' : 'New Order'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingOrder(null);
        }}
      >
        <OrderForm
          initial={editingOrder || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingOrder(null);
          }}
        />
      </Modal>
    </div>
  );
}
