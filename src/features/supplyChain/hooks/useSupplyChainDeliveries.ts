import { useEffect, useState } from 'react';
import type { SupplyChainDelivery } from '../types';
import * as api from '../api/supplyChainDeliveriesApi';

export function useSupplyChainDeliveries() {
  const [deliveries, setDeliveries] = useState<SupplyChainDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.listSupplyChainDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error refreshing deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (
    payload: Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createSupplyChainDelivery(payload);
    setDeliveries((prev) => [created, ...prev]);
    return created;
  };

  const update = async (
    id: string,
    changes: Partial<Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    const updated = await api.updateSupplyChainDelivery(Number(id), changes);
    if (!updated) return;
    setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  };

  const remove = async (id: string) => {
    await api.deleteSupplyChainDelivery(Number(id));
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  };

  const metrics = deliveries.reduce(
    (acc, d) => {
      acc.total += 1;
      if (d.delivery_status === 'RECEIVED') acc.received += 1;
      if (d.delivery_status === 'PENDING' || d.delivery_status === 'IN_TRANSIT') acc.pending += 1;
      if (d.delivery_status === 'DELAYED') acc.delayed += 1;
      if (d.payment_status === 'PAID') acc.paid += 1;
      if (d.quality_status === 'PASSED') acc.qualityPassed += 1;
      return acc;
    },
    { total: 0, received: 0, pending: 0, delayed: 0, paid: 0, qualityPassed: 0 }
  );

  return {
    deliveries,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}

