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
    try {
      const created = await api.createEmployee(payload);
      setEmployees((prev) => [created, ...prev]);
      await refresh(); // Refresh to ensure data consistency
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  };

  const update = async (id: string, changes: Partial<Employee>) => {
    try {
      const updated = await api.updateEmployee(id, changes);
      if (!updated) return;
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      await refresh(); // Refresh to ensure data consistency
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      await refresh(); // Refresh to ensure data consistency
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  const metrics = employees.reduce(
    (acc, e) => {
      acc.total += 1;
      const normalizedStatus = e.status ? String(e.status).toUpperCase() : '';
      if (normalizedStatus === 'ACTIVE') acc.active += 1;
      if (normalizedStatus === 'ON_LEAVE') acc.onLeave += 1;
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



