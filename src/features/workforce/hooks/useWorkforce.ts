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
    try {
      setLoading(true);
      const data = await api.listShifts();
      setShifts(data || []);
    } catch (error) {
      console.error('Error refreshing shifts:', error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await api.createShift(payload);
      setShifts((prev) => [created, ...prev]);
      return created;
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  };

  const update = async (id: string, changes: Partial<Shift>) => {
    try {
      const updated = await api.updateShift(id, changes);
      if (!updated) {
        console.warn('Update returned null, refreshing data...');
        await refresh();
        return null;
      }
      setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteShift(id);
      setShifts((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
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



