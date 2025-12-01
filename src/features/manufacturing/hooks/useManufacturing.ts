import { useEffect, useState } from 'react';
import type { ProductionOrder } from '../types';
import * as api from '../api/manufacturingApi';

export function useManufacturing() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listProductionOrders();
    setOrders(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createProductionOrder(payload);
    setOrders((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<ProductionOrder>) => {
    const updated = await api.updateProductionOrder(id, changes);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const remove = async (id: string) => {
    await api.deleteProductionOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const totals = orders.reduce(
    (acc, order) => {
      if (order.status === 'IN_PROGRESS') acc.inProgress += 1;
      if (order.status === 'COMPLETED') acc.completed += 1;
      return acc;
    },
    { inProgress: 0, completed: 0 }
  );

  return {
    orders,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics: {
      total: orders.length,
      inProgress: totals.inProgress,
      completed: totals.completed
    }
  };
}


