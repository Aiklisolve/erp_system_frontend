import { useState } from 'react';
import { useEcommerce } from '../hooks/useEcommerce';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Product } from '../types';
import { ProductForm } from './ProductForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Badge } from '../../../components/ui/Badge';

export function EcommerceProductsList() {
  const { products, loading, createProduct, removeProduct, metrics } = useEcommerce();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Product>[] = [
    { key: 'name', header: 'Product name' },
    {
      key: 'price',
      header: 'Price',
      render: (row) =>
        row.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <span className={row.stock === 0 ? 'text-red-600 font-semibold' : 'text-text-primary'}>
          {row.stock}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'ACTIVE'
              ? 'success'
              : row.status === 'OUT_OF_STOCK'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeProduct(row.id)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Ecommerce Products"
          description="Manage your product catalog, pricing, and inventory levels. In production this would be backed by the `ecommerce_products` table in Supabase."
        />
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          New product
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total products"
          value={metrics.totalProducts.toString()}
          helper="All products in catalog."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active products"
          value={metrics.activeProducts.toString()}
          helper="Available for purchase."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Out of stock"
          value={metrics.outOfStockProducts.toString()}
          helper="Requires restocking."
          trend={metrics.outOfStockProducts > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Total revenue"
          value={metrics.totalRevenue.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="From completed orders."
          trend="up"
          variant="purple"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Products</h2>
          {loading && <LoadingState label="Loading products..." />}
        </div>
        {products.length === 0 && !loading ? (
          <EmptyState
            title="No products yet"
            description="Create your first demo product to see it appear here."
          />
        ) : (
          <Table
            columns={columns}
            data={products}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No products found."
          />
        )}
      </Card>

      <Modal
        title="New product"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ProductForm
          onSubmit={(values) => {
            void createProduct(values);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
