import { useEffect, useState } from 'react';
import type { ModuleRecord, ModuleRecordStatus } from '../types';

const STORAGE_KEY = 'novaerp-module-records';

function loadAllRecords(): ModuleRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ModuleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllRecords(records: ModuleRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useModuleRecords(moduleSlug: string) {
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = loadAllRecords();
    const filtered = all.filter((r) => r.moduleSlug === moduleSlug);
    setRecords(filtered);
    setLoading(false);
  }, [moduleSlug]);

  const syncAndSet = (updater: (current: ModuleRecord[]) => ModuleRecord[]) => {
    setRecords((current) => {
      const all = loadAllRecords();
      const others = all.filter((r) => r.moduleSlug !== moduleSlug);
      const updatedForModule = updater(current);
      const nextAll = [...others, ...updatedForModule];
      saveAllRecords(nextAll);
      return updatedForModule;
    });
  };

  const createRecord = (partial: Omit<ModuleRecord, 'id' | 'moduleSlug'>) => {
    const now = new Date().toISOString().slice(0, 10);
    const newRecord: ModuleRecord = {
      id: createId(),
      moduleSlug,
      date: now,
      status: 'draft',
      ...partial
    };
    syncAndSet((current) => [newRecord, ...current]);
  };

  const updateRecord = (id: string, changes: Partial<ModuleRecord>) => {
    syncAndSet((current) =>
      current.map((r) => (r.id === id ? { ...r, ...changes, id: r.id } : r))
    );
  };

  const deleteRecord = (id: string) => {
    syncAndSet((current) => current.filter((r) => r.id !== id));
  };

  const changeStatus = (id: string, status: ModuleRecordStatus) => {
    updateRecord(id, { status });
  };

  return {
    records,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
    changeStatus
  };
}


