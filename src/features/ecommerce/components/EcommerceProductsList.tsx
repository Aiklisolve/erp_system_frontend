import { useState } from 'react';
import { useEcommerce } from '../hooks/useEcommerce';
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
import type { Product } from '../types';
import { ProductForm } from './ProductForm';

export function EcommerceProductsList() {
  const { products, loading, createProduct, updateProduct, removeProduct, refresh, metrics } = useEcommerce();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'out_of_stock' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter products based on search, status, category, and active tab
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      (product.product_code && product.product_code.toLowerCase().includes(searchLower)) ||
      (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchLower)) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && product.status === 'ACTIVE') ||
      (activeTab === 'out_of_stock' && (product.status === 'OUT_OF_STOCK' || product.stock === 0)) ||
      (activeTab === 'inactive' && product.status === 'INACTIVE');
    
    return matchesSearch && matchesStatus && matchesCategory && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(products.map((p) => p.status)));
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Calculate metrics
  const metricsByStatus = products.reduce(
    (acc, p) => {
      if (p.status === 'ACTIVE') acc.active += 1;
      if (p.status === 'OUT_OF_STOCK' || p.stock === 0) acc.outOfStock += 1;
      if (p.on_sale) acc.onSale += 1;
      if (p.featured) acc.featured += 1;
      return acc;
    },
    { active: 0, outOfStock: 0, onSale: 0, featured: 0 }
  );

  const columns: TableColumn<Product>[] = [
    {
      key: 'product_code',
      header: 'Code/SKU',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.product_code || row.sku || row.id}</div>
          {row.sku && row.sku !== row.product_code && (
            <div className="text-[10px] text-slate-500">SKU: {row.sku}</div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.short_description && (
            <div className="text-[10px] text-slate-500 line-clamp-1">{row.short_description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => {
        if (!row.category) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-600">{row.category}</span>
            {row.subcategory && (
              <div className="text-[10px] text-slate-400">{row.subcategory}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => {
        const displayPrice = row.sale_price || row.price;
        const hasSale = row.on_sale && row.sale_price && row.sale_price < row.price;
        return (
          <div className="space-y-0.5">
            <div className={`font-medium ${hasSale ? 'text-red-600' : 'text-slate-900'}`}>
              {displayPrice.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'INR' })}
            </div>
            {hasSale && (
              <div className="text-[10px] text-slate-500 line-through">
                {row.price.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'INR' })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => {
        const stock = row.stock || row.stock_quantity || 0;
        const isLowStock = row.low_stock_threshold && stock <= row.low_stock_threshold;
        const stockColor = stock === 0 ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900';
        return (
          <div className="space-y-0.5">
            <span className={`font-medium ${stockColor}`}>{stock}</span>
            {row.low_stock_threshold && (
              <div className="text-[10px] text-slate-500">Threshold: {row.low_stock_threshold}</div>
            )}
          </div>
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
            : row.status === 'OUT_OF_STOCK'
            ? 'danger'
            : row.status === 'DISCONTINUED'
            ? 'danger'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'product_type',
      header: 'Type',
      render: (row) => {
        const typeColors = {
          SIMPLE: 'bg-blue-50 text-blue-700',
          VARIABLE: 'bg-purple-50 text-purple-700',
          BUNDLE: 'bg-amber-50 text-amber-700',
          DIGITAL: 'bg-green-50 text-green-700',
          SERVICE: 'bg-indigo-50 text-indigo-700',
        };
        const color = typeColors[row.product_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {row.product_type}
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
              setEditingProduct(row);
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

  const handleFormSubmit = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        showToast('success', 'Product Updated', `Product "${data.name}" has been updated successfully.`);
      } else {
        await createProduct(data);
        showToast('success', 'Product Created', `Product "${data.name}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(product.id);
        showToast('success', 'Product Deleted', `Product "${product.name}" has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Ecommerce Products
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage your product catalog, pricing, inventory levels, and product information for your ecommerce store.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
        >
          New Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Products"
          value={metrics.totalProducts.toString()}
          helper="All products in catalog."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active Products"
          value={metrics.activeProducts.toString()}
          helper="Available for purchase."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Out of Stock"
          value={metrics.outOfStockProducts.toString()}
          helper="Requires restocking."
          trend={metrics.outOfStockProducts > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="On Sale"
          value={metricsByStatus.onSale.toString()}
          helper="Currently on sale."
          trend="up"
          variant="purple"
        />
        <StatCard
          label="Total Revenue"
          value={metrics.totalRevenue.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="From completed orders."
          trend="up"
          variant="yellow"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Products' },
            { id: 'active', label: 'Active' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'inactive', label: 'Inactive' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'active' | 'out_of_stock' | 'inactive');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by product name, SKU, code, category, brand, or tags..."
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
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading products..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first product to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedProducts}
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
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium text-slate-900">{filteredProducts.length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'New Product'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        hideCloseButton
      >
        <ProductForm
          initial={editingProduct || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
}
