import { useEffect, useState } from 'react';
import type { FinanceTransaction } from '../types';
import type { DashboardStats } from '../api/financeApi';
import * as api from '../api/financeApi';

export function useFinance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    void refresh();
    void refreshDashboardStats();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listTransactions();
    setTransactions(data);
    setLoading(false);
  };

  const refreshDashboardStats = async () => {
    setStatsLoading(true);
    const stats = await api.getDashboardStats();
    setDashboardStats(stats);
    setStatsLoading(false);
  };

  const create = async (
    payload: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createTransaction(payload);
    setTransactions((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<FinanceTransaction>) => {
    const updated = await api.updateTransaction(id, changes);
    if (!updated) return;
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const remove = async (id: string) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'INCOME') acc.income += tx.amount;
      if (tx.type === 'EXPENSE') acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;

  return {
    transactions,
    loading,
    statsLoading,
    dashboardStats,
    create,
    update,
    remove,
    refresh,
    refreshDashboardStats,
    summary: {
      income: totals.income,
      expense: totals.expense,
      net
    }
  };
}


