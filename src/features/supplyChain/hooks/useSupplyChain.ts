import { useEffect, useState } from 'react';
import type { Supplier } from '../types';
import * as api from '../api/supplyChainApi';

export function useSupplyChain() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createSupplier(payload);
    setSuppliers((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Supplier>) => {
    const updated = await api.updateSupplier(id, changes);
    if (!updated) return;
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const remove = async (id: string) => {
    await api.deleteSupplier(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const metrics = suppliers.reduce(
    (acc, s) => {
      acc.total += 1;
      acc.avgRating += s.rating;
      return acc;
    },
    { total: 0, avgRating: 0 }
  );

  const avgRating =
    metrics.total === 0 ? 0 : Number((metrics.avgRating / metrics.total).toFixed(1));

  return {
    suppliers,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics: {
      total: metrics.total,
      avgRating
    }
  };
}


