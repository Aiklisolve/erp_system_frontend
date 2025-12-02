import { useEffect, useState } from 'react';
import type { Employee } from '../types';
import * as api from '../api/hrApi';

export function useHr() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createEmployee(payload);
    setEmployees((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Employee>) => {
    const updated = await api.updateEmployee(id, changes);
    if (!updated) return;
    setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const remove = async (id: string) => {
    await api.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const metrics = employees.reduce(
    (acc, e) => {
      acc.total += 1;
      if (e.status === 'ACTIVE') acc.active += 1;
      if (e.status === 'ON_LEAVE') acc.onLeave += 1;
      return acc;
    },
    { total: 0, active: 0, onLeave: 0 }
  );

  return {
    employees,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}



