import { useEffect, useState } from 'react';
import type { Project } from '../types';
import * as api from '../api/projectsApi';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await api.listProjects();
    setProjects(data);
    setLoading(false);
  };

  const create = async (payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await api.createProject(payload);
    setProjects((prev) => [created, ...prev]);
  };

  const update = async (id: string, changes: Partial<Project>) => {
    const updated = await api.updateProject(id, changes);
    if (!updated) return;
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const remove = async (id: string) => {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Metrics
  const metrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    completedProjects: projects.filter((p) => p.status === 'COMPLETED').length,
    onHoldProjects: projects.filter((p) => p.status === 'ON_HOLD').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    activeBudget: projects
      .filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING')
      .reduce((sum, p) => sum + p.budget, 0)
  };

  return {
    projects,
    loading,
    create,
    update,
    remove,
    refresh,
    metrics
  };
}

