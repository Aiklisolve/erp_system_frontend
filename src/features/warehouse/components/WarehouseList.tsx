import { useState, useEffect } from 'react';
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
import type { StockMovement, Warehouse } from '../types';
import { WarehouseForm } from './WarehouseForm';
import { CreateWarehouseForm } from './CreateWarehouseForm';
import * as warehouseApi from '../api/warehouseApi';

export function WarehouseList() {
  // Map tab to movement type for API filtering
  const getMovementTypeForTab = (tab: string): string | undefined => {
    if (tab === 'all') return undefined;
    return tab.toUpperCase(); // transfer -> TRANSFER, receipt -> RECEIPT, etc.
  };
  
  const [activeTab, setActiveTab] = useState<'all' | 'transfer' | 'receipt' | 'shipment' | 'adjustment' | 'warehouses'>('all');
  const movementTypeForApi = getMovementTypeForTab(activeTab);
  const { movements, loading, create, update, remove, refresh, metrics } = useWarehouse(movementTypeForApi);
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState('');
  const [warehouseCurrentPage, setWarehouseCurrentPage] = useState(1);
  const [warehouseItemsPerPage, setWarehouseItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter movements based on search and status (movement type filtering is done by API)
  const filteredMovements = movements.filter((movement) => {
    // Search filter
    if (searchTerm) {
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
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
    
    // Movement type is already filtered by API, but double-check for safety
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'transfer' && movement.movement_type === 'TRANSFER') ||
      (activeTab === 'receipt' && movement.movement_type === 'RECEIPT') ||
      (activeTab === 'shipment' && movement.movement_type === 'SHIPMENT') ||
      (activeTab === 'adjustment' && movement.movement_type === 'ADJUSTMENT');
    
    return matchesStatus && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = filteredMovements.slice(startIndex, startIndex + itemsPerPage);

  // Get unique types and statuses for filters
  const movementTypes = Array.from(
    new Set(movements.map((mv) => mv.movement_type).filter((type): type is Exclude<StockMovement["movement_type"], undefined | null> => type != null))
  );
  const statuses = Array.from(
    new Set(movements.map((mv) => mv.status).filter((status): status is Exclude<StockMovement["status"], undefined | null> => status != null))
  );

  // Calculate metrics by type - need to fetch all movements for accurate metrics
  // Store all movements separately for metrics calculation
  const [allMovementsForMetrics, setAllMovementsForMetrics] = useState<StockMovement[]>([]);
  
  useEffect(() => {
    // Fetch all movements for metrics calculation (without type filter)
    const fetchAllForMetrics = async () => {
      try {
        const data = await warehouseApi.listStockMovements();
        setAllMovementsForMetrics(data);
      } catch (error) {
        console.error('Error fetching all movements for metrics:', error);
      }
    };
    fetchAllForMetrics();
  }, []);
  
  const metricsByType = allMovementsForMetrics.reduce(
    (acc, mv) => {
      if (mv.movement_type === 'TRANSFER') acc.transfers += 1;
      if (mv.movement_type === 'RECEIPT') acc.receipts += 1;
      if (mv.movement_type === 'SHIPMENT') acc.shipments += 1;
      if (mv.movement_type === 'ADJUSTMENT') acc.adjustments += 1;
      if (mv.status === 'PENDING') acc.pending += 1;
      if (mv.status === 'COMPLETED') acc.completed += 1;
      return acc;
    },
    { transfers: 0, receipts: 0, shipments: 0, adjustments: 0, pending: 0, completed: 0 }
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
          IN: 'bg-green-50 text-green-700',
          OUT: 'bg-purple-50 text-purple-700',
        };
        const color = typeColors[row.movement_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
            {row.movement_type ? row.movement_type.replace('_', ' ') : 'N/A'}
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
        return <Badge tone={statusTone}>{row.status ? row.status.replace('_', ' ') : 'N/A'}</Badge>;
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
      // Refresh metrics after create/update
      const allData = await warehouseApi.listStockMovements();
      setAllMovementsForMetrics(allData);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save stock movement. Please try again.');
    }
  };

  const handleDelete = async (movement: StockMovement) => {
    if (window.confirm('Are you sure you want to delete this stock movement?')) {
      try {
        await remove(movement.id);
        showToast('success', 'Stock Movement Deleted', `Movement ${movement.movement_number || 'record'} has been deleted successfully.`);
        // Refresh metrics after delete
        const allData = await warehouseApi.listStockMovements();
        setAllMovementsForMetrics(allData);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete stock movement. Please try again.');
      }
    }
  };

  // Load warehouses when warehouses tab is active
  const loadWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      const data = await warehouseApi.listWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      showToast('error', 'Error', 'Failed to load warehouses');
    } finally {
      setWarehousesLoading(false);
    }
  };

  // Load warehouses when tab changes to warehouses
  useEffect(() => {
    if (activeTab === 'warehouses') {
      loadWarehouses();
    }
  }, [activeTab]);

  // Warehouse handlers
  const handleWarehouseSubmit = async (data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingWarehouse) {
        await warehouseApi.updateWarehouse(editingWarehouse.id, data);
        showToast('success', 'Warehouse Updated', `Warehouse ${data.name} has been updated successfully.`);
      } else {
        await warehouseApi.createWarehouse(data);
        showToast('success', 'Warehouse Created', `Warehouse ${data.name} has been created successfully.`);
      }
      setWarehouseModalOpen(false);
      setEditingWarehouse(null);
      await loadWarehouses();
    } catch (error: any) {
      showToast('error', 'Operation Failed', error.message || 'Failed to save warehouse. Please try again.');
    }
  };

  const handleWarehouseDelete = async (warehouse: Warehouse) => {
    if (window.confirm(`Are you sure you want to delete warehouse "${warehouse.name}"?`)) {
      try {
        await warehouseApi.deleteWarehouse(warehouse.id);
        showToast('success', 'Warehouse Deleted', `Warehouse ${warehouse.name} has been deleted successfully.`);
        await loadWarehouses();
      } catch (error: any) {
        showToast('error', 'Deletion Failed', error.message || 'Failed to delete warehouse. Please try again.');
      }
    }
  };

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchLower = warehouseSearchTerm.toLowerCase();
    return (
      !warehouseSearchTerm ||
      (warehouse.warehouse_code && warehouse.warehouse_code.toLowerCase().includes(searchLower)) ||
      (warehouse.name && warehouse.name.toLowerCase().includes(searchLower)) ||
      (warehouse.address && warehouse.address.toLowerCase().includes(searchLower)) ||
      (warehouse.city && warehouse.city.toLowerCase().includes(searchLower)) ||
      (warehouse.state && warehouse.state.toLowerCase().includes(searchLower)) ||
      (warehouse.country && warehouse.country.toLowerCase().includes(searchLower))
    );
  });

  // Warehouse pagination
  const warehouseTotalPages = Math.ceil(filteredWarehouses.length / warehouseItemsPerPage);
  const warehouseStartIndex = (warehouseCurrentPage - 1) * warehouseItemsPerPage;
  const paginatedWarehouses = filteredWarehouses.slice(warehouseStartIndex, warehouseStartIndex + warehouseItemsPerPage);

  // Warehouse table columns
  const warehouseColumns: TableColumn<Warehouse>[] = [
    {
      key: 'warehouse_code',
      header: 'Code',
      render: (row) => <div className="font-medium text-slate-900">{row.warehouse_code}</div>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => <div className="font-medium text-slate-900">{row.name}</div>,
    },
    {
      key: 'address',
      header: 'Location',
      render: (row) => (
        <div className="space-y-0.5">
          {row.address && <div className="text-slate-900">{row.address}</div>}
          {(row.city || row.state) && (
            <div className="text-[10px] text-slate-500">
              {[row.city, row.state, row.pincode].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (row) => <div className="text-slate-900">{row.country || '—'}</div>,
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row) => <div className="text-slate-900">{row.capacity ? row.capacity.toLocaleString() : '—'}</div>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
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
              setEditingWarehouse(row);
              setWarehouseModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleWarehouseDelete(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
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
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Track stock movements, transfers, receipts, shipments, and adjustments across warehouse locations.
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingWarehouse(null);
              setWarehouseModalOpen(true);
            }}
          >
            New Warehouse
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="Total Movements"
          value={allMovementsForMetrics.length.toString()}
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
          label="Shipments"
          value={metricsByType.shipments.toString()}
          helper="Goods shipped."
          trend="flat"
          variant="purple"
        />
        <StatCard
          label="Adjustments"
          value={metricsByType.adjustments.toString()}
          helper="Stock adjustments."
          trend="flat"
          variant="orange"
        />
        <StatCard
          label="Pending"
          value={metricsByType.pending.toString()}
          helper="Awaiting completion."
          trend={metricsByType.pending > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Movements' },
            { id: 'transfer', label: 'Transfers' },
            { id: 'receipt', label: 'Receipts' },
            { id: 'shipment', label: 'Shipments' },
            { id: 'adjustment', label: 'Adjustments' },
            { id: 'warehouses', label: 'Warehouses' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'transfer' | 'receipt' | 'shipment' | 'adjustment' | 'warehouses');
            setCurrentPage(1);
          }}
        />

        {/* Filters - Only show for movement tabs */}
        {activeTab !== 'warehouses' && (
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
                {status ? status.replace('_', ' ') : 'N/A'}
              </option>
            ))}
          </Select>
        </div>
        )}

        {/* Table */}
        {activeTab === 'warehouses' ? (
          // Warehouses Tab
          <>
            {/* Warehouse Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by warehouse code, name, address, city, state, or country..."
                  value={warehouseSearchTerm}
                  onChange={(e) => {
                    setWarehouseSearchTerm(e.target.value);
                    setWarehouseCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {warehousesLoading ? (
              <div className="py-12 sm:py-16">
                <LoadingState label="Loading warehouses..." size="md" variant="default" />
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <EmptyState
                title="No warehouses found"
                description={
                  warehouseSearchTerm
                    ? 'Try adjusting your search to see more results.'
                    : 'Create your first warehouse to get started.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={warehouseColumns}
                    data={paginatedWarehouses}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Warehouse Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={warehouseItemsPerPage}
                        onChange={(e) => {
                          setWarehouseItemsPerPage(Number(e.target.value));
                          setWarehouseCurrentPage(1);
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
                        page={warehouseCurrentPage}
                        totalPages={warehouseTotalPages}
                        onChange={setWarehouseCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{warehouseStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(warehouseStartIndex + warehouseItemsPerPage, filteredWarehouses.length)}</span> of <span className="font-medium text-slate-900">{filteredWarehouses.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : loading ? (
          <div className="py-12 sm:py-16">
            <LoadingState label="Loading stock movements..." size="md" variant="default" />
          </div>
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

      {/* Stock Movement Modal */}
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

      {/* Warehouse Modal */}
      <Modal
        title={editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
        open={warehouseModalOpen}
        onClose={() => {
          setWarehouseModalOpen(false);
          setEditingWarehouse(null);
        }}
        hideCloseButton
      >
        <CreateWarehouseForm
          initial={editingWarehouse || undefined}
          onSubmit={handleWarehouseSubmit}
          onCancel={() => {
            setWarehouseModalOpen(false);
            setEditingWarehouse(null);
          }}
        />
      </Modal>
    </div>
  );
}
