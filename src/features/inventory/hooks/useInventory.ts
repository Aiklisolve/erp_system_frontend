import { useEffect, useState } from 'react';
import type { InventoryItem } from '../types';
import * as api from '../api/inventoryApi';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listInventory();
    setItems(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createInventoryItem(payload);
    setItems((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<InventoryItem>) => {
    const updated = await api.updateInventoryItem(id, changes);
    if (!updated) return;
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const remove = async (id: string) => {
    await api.deleteInventoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const metrics = items.reduce(
    (acc, item) => {
      if (item.qty_on_hand <= item.reorder_level) acc.lowStock += 1;
      acc.totalQty += item.qty_on_hand;
      return acc;
    },
    { lowStock: 0, totalQty: 0 }
  );

  return {
    items,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics: {
      totalItems: items.length,
      lowStock: metrics.lowStock,
      totalQty: metrics.totalQty
    }
  };
}


