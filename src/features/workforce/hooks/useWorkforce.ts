import { useEffect, useState } from 'react';
import type { Shift } from '../types';
import * as api from '../api/workforceApi';

export function useWorkforce() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listShifts();
    setShifts(data);
    setLoading(false);
  };

  const create = async (payload: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await api.createShift(payload);
    setShifts((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Shift>) => {
    const updated = await api.updateShift(id, changes);
    if (!updated) return;
    setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const remove = async (id: string) => {
    await api.deleteShift(id);
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const metrics = shifts.reduce(
    (acc, s) => {
      acc.total += 1;
      acc.coveredDates.add(s.date);
      return acc;
    },
    { total: 0, coveredDates: new Set<string>() }
  );

  return {
    shifts,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics: {
      totalShifts: metrics.total,
      daysCovered: metrics.coveredDates.size
    }
  };
}



