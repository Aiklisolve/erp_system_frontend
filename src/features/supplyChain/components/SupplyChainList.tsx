import { useState } from 'react';
import { useSupplyChain } from '../hooks/useSupplyChain';
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
import type { Supplier } from '../types';
import { SupplierForm } from './SupplierForm';

export function SupplyChainList() {
  const { suppliers, loading, create, update, remove, refresh, metrics } = useSupplyChain();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter suppliers based on search, status, category, rating, and active tab
  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchLower) ||
      (supplier.supplier_code && supplier.supplier_code.toLowerCase().includes(searchLower)) ||
      (supplier.legal_name && supplier.legal_name.toLowerCase().includes(searchLower)) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchLower)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchLower)) ||
      supplier.phone.includes(searchTerm) ||
      (supplier.tax_id && supplier.tax_id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesRating =
      ratingFilter === 'all' ||
      (ratingFilter === 'high' && supplier.rating >= 4.5) ||
      (ratingFilter === 'medium' && supplier.rating >= 3.5 && supplier.rating < 4.5) ||
      (ratingFilter === 'low' && supplier.rating < 3.5);
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && supplier.status === 'ACTIVE') ||
      (activeTab === 'inactive' && supplier.status === 'INACTIVE') ||
      (activeTab === 'suspended' && supplier.status === 'SUSPENDED');
    
    return matchesSearch && matchesStatus && matchesCategory && matchesRating && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Get unique statuses, categories for filters
  const statuses = Array.from(new Set(suppliers.map((s) => s.status)));
  const categories = Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean)));

  // Calculate metrics
  const metricsByStatus = suppliers.reduce(
    (acc, s) => {
      if (s.status === 'ACTIVE') acc.active += 1;
      if (s.status === 'INACTIVE') acc.inactive += 1;
      if (s.status === 'SUSPENDED') acc.suspended += 1;
      if (s.rating >= 4.5) acc.highRated += 1;
      if (s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL') acc.highRisk += 1;
      return acc;
    },
    { active: 0, inactive: 0, suspended: 0, highRated: 0, highRisk: 0 }
  );

  const columns: TableColumn<Supplier>[] = [
    {
      key: 'supplier_code',
      header: 'Code',
      render: (row) => row.supplier_code || row.id,
    },
    {
      key: 'name',
      header: 'Supplier',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.legal_name && (
            <div className="text-[10px] text-slate-500">{row.legal_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact_person',
      header: 'Contact',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.contact_person}</div>
          {row.email && (
            <div className="text-[10px] text-slate-500">{row.email}</div>
          )}
        </div>
      ),
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'category',
      header: 'Category',
      render: (row) => {
        if (!row.category) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <span className="text-[11px] text-slate-600">
            {row.category.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'ACTIVE'
            ? 'success'
            : row.status === 'SUSPENDED' || row.status === 'BLACKLISTED'
            ? 'danger'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status}</Badge>;
      },
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => {
        const ratingColor =
          row.rating >= 4.5
            ? 'text-emerald-700 bg-emerald-50'
            : row.rating >= 3.5
            ? 'text-blue-700 bg-blue-50'
            : row.rating >= 2.5
            ? 'text-amber-700 bg-amber-50'
            : 'text-red-700 bg-red-50';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ratingColor} border`}>
            {row.rating.toFixed(1)} ⭐
          </span>
        );
      },
    },
    {
      key: 'risk_level',
      header: 'Risk',
      render: (row) => {
        if (!row.risk_level) return <span className="text-[11px] text-slate-400">-</span>;
        const riskColors = {
          LOW: 'text-emerald-700 bg-emerald-50',
          MEDIUM: 'text-amber-700 bg-amber-50',
          HIGH: 'text-orange-700 bg-orange-50',
          CRITICAL: 'text-red-700 bg-red-50',
        };
        const color = riskColors[row.risk_level] || 'text-slate-700 bg-slate-50';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {row.risk_level}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingSupplier(row);
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

  const handleFormSubmit = async (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingSupplier) {
      await update(editingSupplier.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Supply Chain Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage suppliers, track performance metrics, monitor risk levels, and maintain compliance across your supply chain network.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingSupplier(null);
            setModalOpen(true);
          }}
        >
          New Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Suppliers"
          value={metrics.total.toString()}
          helper="All suppliers in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active Suppliers"
          value={metricsByStatus.active.toString()}
          helper="Currently active."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Average Rating"
          value={metrics.avgRating.toFixed(1)}
          helper="Overall performance rating."
          trend="flat"
          variant="yellow"
        />
        <StatCard
          label="High Rated (4.5+)"
          value={metricsByStatus.highRated.toString()}
          helper="Top performing suppliers."
          trend="up"
          variant="purple"
        />
        <StatCard
          label="High Risk"
          value={metricsByStatus.highRisk.toString()}
          helper="Requires attention."
          trend={metricsByStatus.highRisk > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Suppliers' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'suspended', label: 'Suspended' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'active' | 'inactive' | 'suspended');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by supplier name, code, contact, email, phone, or tax ID..."
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
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat?.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Ratings</option>
            <option value="high">High (4.5+)</option>
            <option value="medium">Medium (3.5-4.4)</option>
            <option value="low">Low (&lt;3.5)</option>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading suppliers..." />
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description={
              searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || ratingFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first supplier to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedSuppliers}
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
        title={editingSupplier ? 'Edit Supplier' : 'New Supplier'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
      >
        <SupplierForm
          initial={editingSupplier || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      </Modal>
    </div>
  );
}
