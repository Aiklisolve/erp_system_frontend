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
    try {
      const data = await api.listStockMovements();
      console.log('useWarehouse - fetched movements:', data);
      console.log('useWarehouse - movements count:', data.length);
      setMovements(data);
    } catch (error) {
      console.error('useWarehouse - error fetching movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (
    payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createStockMovement(payload);
    await refresh(); // Refresh to get latest data
    return created;
  };

  const update = async (id: string, changes: Partial<StockMovement>) => {
    const updated = await api.updateStockMovement(id, changes);
    if (!updated) return;
    await refresh(); // Refresh to get latest data
    return updated;
  };

  const remove = async (id: string) => {
    await api.deleteStockMovement(id);
    await refresh(); // Refresh to get latest data
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


