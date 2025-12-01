import { useEffect, useState } from 'react';
import type { StockMovement } from '../types';
import * as api from '../api/warehouseApi';

export function useWarehouse() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listStockMovements();
    setMovements(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createStockMovement(payload);
    setMovements((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<StockMovement>) => {
    const updated = await api.updateStockMovement(id, changes);
    if (!updated) return;
    setMovements((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const remove = async (id: string) => {
    await api.deleteStockMovement(id);
    setMovements((prev) => prev.filter((m) => m.id !== id));
  };

  const metrics = movements.reduce(
    (acc, mv) => {
      acc.totalMoves += 1;
      acc.totalQty += mv.quantity;
      return acc;
    },
    { totalMoves: 0, totalQty: 0 }
  );

  return {
    movements,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}


