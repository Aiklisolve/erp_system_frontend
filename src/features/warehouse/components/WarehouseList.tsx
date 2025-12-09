import { useState } from 'react';
import { useWarehouse } from '../hooks/useWarehouse';
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
import type { StockMovement } from '../types';
import { WarehouseForm } from './WarehouseForm';

export function WarehouseList() {
  const { movements, loading, create, update, remove, refresh, metrics } = useWarehouse();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'transfers' | 'receipts' | 'shipments' | 'adjustments'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter movements based on search, type, status, and active tab
  const filteredMovements = movements.filter((movement) => {
    if (!searchTerm) {
      // No search term, check other filters
    } else {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (movement.item_id?.toLowerCase() || '').includes(searchLower) ||
        (movement.item_name?.toLowerCase() || '').includes(searchLower) ||
        (movement.item_sku?.toLowerCase() || '').includes(searchLower) ||
        (movement.movement_number?.toLowerCase() || '').includes(searchLower) ||
        (movement.reference_number?.toLowerCase() || '').includes(searchLower) ||
        (movement.tracking_number?.toLowerCase() || '').includes(searchLower) ||
        (movement.from_location?.toLowerCase() || '').includes(searchLower) ||
        (movement.to_location?.toLowerCase() || '').includes(searchLower) ||
        (movement.movement_date || '').includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    
    const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'transfers' && movement.movement_type === 'TRANSFER') ||
      (activeTab === 'receipts' && movement.movement_type === 'RECEIPT') ||
      (activeTab === 'shipments' && movement.movement_type === 'SHIPMENT') ||
      (activeTab === 'adjustments' && movement.movement_type === 'ADJUSTMENT');
    
    return matchesStatus && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = filteredMovements.slice(startIndex, startIndex + itemsPerPage);

  // Get unique types and statuses for filters
  const movementTypes = Array.from(new Set(movements.map((m) => m.movement_type)));
  const statuses = Array.from(new Set(movements.map((m) => m.status)));

  // Calculate metrics by type
  const metricsByType = movements.reduce(
    (acc, mv) => {
      if (mv.movement_type === 'TRANSFER') acc.transfers += 1;
      if (mv.movement_type === 'RECEIPT') acc.receipts += 1;
      if (mv.movement_type === 'SHIPMENT') acc.shipments += 1;
      if (mv.status === 'PENDING') acc.pending += 1;
      if (mv.status === 'COMPLETED') acc.completed += 1;
      return acc;
    },
    { transfers: 0, receipts: 0, shipments: 0, pending: 0, completed: 0 }
  );

  const columns: TableColumn<StockMovement>[] = [
    {
      key: 'movement_number',
      header: 'Movement #',
      render: (row) => row.movement_number || row.id,
    },
    { key: 'movement_date', header: 'Date' },
    {
      key: 'item_id',
      header: 'Item',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.item_id}</div>
          {row.item_name && (
            <div className="text-[10px] text-slate-500">{row.item_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'movement_type',
      header: 'Type',
      render: (row) => {
        const typeColors = {
          TRANSFER: 'bg-blue-50 text-blue-700',
          RECEIPT: 'bg-green-50 text-green-700',
          SHIPMENT: 'bg-purple-50 text-purple-700',
          ADJUSTMENT: 'bg-amber-50 text-amber-700',
          RETURN: 'bg-red-50 text-red-700',
          CYCLE_COUNT: 'bg-indigo-50 text-indigo-700',
        };
        const color = typeColors[row.movement_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
            {row.movement_type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'COMPLETED'
            ? 'success'
            : row.status === 'CANCELLED'
            ? 'danger'
            : row.status === 'IN_PROGRESS'
            ? 'warning'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'from_location',
      header: 'From',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.from_location}</div>
          {row.from_zone && (
            <div className="text-[10px] text-slate-500">{row.from_zone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'to_location',
      header: 'To',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.to_location}</div>
          {row.to_zone && (
            <div className="text-[10px] text-slate-500">{row.to_zone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.quantity}</div>
          {row.unit && (
            <div className="text-[10px] text-slate-500">{row.unit}</div>
          )}
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
              setEditingMovement(row);
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

  const handleFormSubmit = async (data: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingMovement) {
        await update(editingMovement.id, data);
        showToast('success', 'Stock Movement Updated', `Movement ${data.movement_number || 'record'} has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Stock Movement Created', `Movement ${data.movement_number || 'record'} has been created successfully.`);
      }
      setModalOpen(false);
      setEditingMovement(null);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save stock movement. Please try again.');
    }
  };

  const handleDelete = async (movement: StockMovement) => {
    if (window.confirm('Are you sure you want to delete this stock movement?')) {
      try {
        await remove(movement.id);
        showToast('success', 'Stock Movement Deleted', `Movement ${movement.movement_number || 'record'} has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete stock movement. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track stock movements, transfers, receipts, shipments, and adjustments across warehouse locations.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingMovement(null);
            setModalOpen(true);
          }}
        >
          New Movement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Movements"
          value={metrics.totalMoves.toString()}
          helper="All stock movements."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Transfers"
          value={metricsByType.transfers.toString()}
          helper="Location transfers."
          trend="flat"
          variant="blue"
        />
        <StatCard
          label="Receipts"
          value={metricsByType.receipts.toString()}
          helper="Goods received."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Pending"
          value={metricsByType.pending.toString()}
          helper="Awaiting completion."
          trend={metricsByType.pending > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Total Quantity"
          value={metrics.totalQty.toString()}
          helper="Total units moved."
          trend="flat"
          variant="purple"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Movements' },
            { id: 'transfers', label: 'Transfers' },
            { id: 'receipts', label: 'Receipts' },
            { id: 'shipments', label: 'Shipments' },
            { id: 'adjustments', label: 'Adjustments' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'transfers' | 'receipts' | 'shipments' | 'adjustments');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by item ID, SKU, movement #, reference, tracking, or location..."
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
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading stock movements..." />
        ) : filteredMovements.length === 0 ? (
          <EmptyState
            title="No stock movements found"
            description={
              searchTerm || statusFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first stock movement to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedMovements}
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
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredMovements.length)}</span> of <span className="font-medium text-slate-900">{filteredMovements.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingMovement ? 'Edit Stock Movement' : 'New Stock Movement'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMovement(null);
        }}
        hideCloseButton
      >
        <WarehouseForm
          initial={editingMovement || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingMovement(null);
          }}
        />
      </Modal>
    </div>
  );
}
