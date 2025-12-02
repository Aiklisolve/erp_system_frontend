import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Project } from '../types';

let useStatic = !hasSupabaseConfig;

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'ERP System Implementation',
    client: 'Acme Corporation',
    status: 'IN_PROGRESS',
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    budget: 125000,
    created_at: '2024-12-10'
  },
  {
    id: 'proj-2',
    name: 'Cloud Migration Project',
    client: 'Tech Solutions Inc',
    status: 'PLANNING',
    start_date: '2025-02-01',
    end_date: '2025-08-31',
    budget: 85000,
    created_at: '2024-12-15'
  },
  {
    id: 'proj-3',
    name: 'Mobile App Development',
    client: 'StartupXYZ',
    status: 'COMPLETED',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
    budget: 95000,
    created_at: '2024-08-20'
  }
];

function nextId() {
  return `proj-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProjects(): Promise<Project[]> {
  if (useStatic) return mockProjects;

  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return (data as Project[]) ?? [];
  } catch (error) {
    handleApiError('projects.listProjects', error);
    useStatic = true;
    return mockProjects;
  }
}

export async function createProject(
  payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  if (useStatic) {
    const project: Project = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockProjects.unshift(project);
    return project;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  } catch (error) {
    handleApiError('projects.createProject', error);
    useStatic = true;
    return createProject(payload);
  }
}

export async function updateProject(
  id: string,
  changes: Partial<Project>
): Promise<Project | null> {
  if (useStatic) {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProjects[index] = { ...mockProjects[index], ...changes };
    return mockProjects[index];
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  } catch (error) {
    handleApiError('projects.updateProject', error);
    useStatic = true;
    return updateProject(id, changes);
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (useStatic) {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) mockProjects.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('projects.deleteProject', error);
    useStatic = true;
    await deleteProject(id);
  }
}

