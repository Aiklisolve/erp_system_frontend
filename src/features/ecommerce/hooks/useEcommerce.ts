import { useEffect, useState } from 'react';
import type { Product, OnlineOrder } from '../types';
import * as api from '../api/ecommerceApi';

export function useEcommerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const [productsData, ordersData] = await Promise.all([
      api.listProducts(),
      api.listOnlineOrders()
    ]);
    setProducts(productsData);
    setOrders(ordersData);
    setLoading(false);
  };

  // Products
  const createProduct = async (
    payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createProduct(payload);
    setProducts((prev) => [created, ...prev]);
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    const updated = await api.updateProduct(id, changes);
    if (!updated) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const removeProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Orders
  const createOrder = async (
    payload: Omit<OnlineOrder, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createOnlineOrder(payload);
    setOrders((prev) => [created, ...prev]);
  };

  const updateOrder = async (id: string, changes: Partial<OnlineOrder>) => {
    const updated = await api.updateOnlineOrder(id, changes);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const removeOrder = async (id: string) => {
    await api.deleteOnlineOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Metrics
  const metrics = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
    outOfStockProducts: products.filter((p) => p.status === 'OUT_OF_STOCK').length,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total_amount, 0),
    pendingOrders: orders.filter((o) => o.status === 'PENDING').length
  };

  return {
    products,
    orders,
    loading,
    createProduct,
    updateProduct,
    removeProduct,
    createOrder,
    updateOrder,
    removeOrder,
    refresh,
    metrics
  };
}

