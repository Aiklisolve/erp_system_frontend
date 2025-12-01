import { useEffect, useState } from 'react';
import type { SalesOrder } from '../types';
import * as api from '../api/ordersApi';

export function useOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listSalesOrders();
    setOrders(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createSalesOrder(payload);
    setOrders((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<SalesOrder>) => {
    const updated = await api.updateSalesOrder(id, changes);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const remove = async (id: string) => {
    await api.deleteSalesOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const metrics = orders.reduce(
    (acc, order) => {
      if (order.status === 'PENDING') acc.pending += 1;
      if (order.status === 'CONFIRMED') acc.confirmed += 1;
      if (order.status === 'SHIPPED') acc.shipped += 1;
      acc.totalValue += order.total_amount;
      return acc;
    },
    { pending: 0, confirmed: 0, shipped: 0, totalValue: 0 }
  );

  return {
    orders,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}


