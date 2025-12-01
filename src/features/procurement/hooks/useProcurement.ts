import { useEffect, useState } from 'react';
import type { PurchaseOrder } from '../types';
import * as api from '../api/procurementApi';

export function useProcurement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listPurchaseOrders();
    setOrders(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createPurchaseOrder(payload);
    setOrders((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<PurchaseOrder>) => {
    const updated = await api.updatePurchaseOrder(id, changes);
    if (!updated) return;
    setOrders((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const remove = async (id: string) => {
    await api.deletePurchaseOrder(id);
    setOrders((prev) => prev.filter((p) => p.id !== id));
  };

  const totalOpen = orders.filter((o) => o.status !== 'RECEIVED').length;

  return {
    orders,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics: {
      total: orders.length,
      open: totalOpen
    }
  };
}


