import { useEffect, useState } from 'react';
import type { Customer } from '../types';
import * as api from '../api/crmApi';

export function useCrm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listCustomers();
    setCustomers(data);
    setLoading(false);
  };

  const create = async (
    payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createCustomer(payload);
    setCustomers((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Customer>) => {
    const updated = await api.updateCustomer(id, changes);
    if (!updated) return;
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const remove = async (id: string) => {
    await api.deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const metrics = customers.reduce(
    (acc, c) => {
      acc.total += 1;
      acc.bySegment[c.segment] = (acc.bySegment[c.segment] ?? 0) + 1;
      return acc;
    },
    { total: 0, bySegment: {} as Record<string, number> }
  );

  return {
    customers,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}



