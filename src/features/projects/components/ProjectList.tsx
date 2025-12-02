import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { Project } from '../types';
import { ProjectForm } from './ProjectForm';

export function ProjectList() {
  const { projects, loading, create, update, remove, refresh, metrics } = useProjects();
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'on_hold'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter projects based on search, status, type, priority, and active tab
  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(searchLower) ||
      (project.project_code && project.project_code.toLowerCase().includes(searchLower)) ||
      project.client.toLowerCase().includes(searchLower) ||
      (project.client_contact_person && project.client_contact_person.toLowerCase().includes(searchLower)) ||
      (project.client_email && project.client_email.toLowerCase().includes(searchLower)) ||
      (project.project_manager && project.project_manager.toLowerCase().includes(searchLower)) ||
      (project.description && project.description.toLowerCase().includes(searchLower)) ||
      (project.contract_number && project.contract_number.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.project_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'in_progress' && project.status === 'IN_PROGRESS') ||
      (activeTab === 'completed' && project.status === 'COMPLETED') ||
      (activeTab === 'on_hold' && project.status === 'ON_HOLD');
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const statuses = Array.from(new Set(projects.map((p) => p.status)));
  const types = Array.from(new Set(projects.map((p) => p.project_type)));
  const priorities = Array.from(new Set(projects.map((p) => p.priority).filter(Boolean)));

  // Calculate metrics
  const metricsByStatus = projects.reduce(
    (acc, p) => {
      if (p.status === 'IN_PROGRESS') acc.inProgress += 1;
      if (p.status === 'COMPLETED') acc.completed += 1;
      if (p.status === 'ON_HOLD') acc.onHold += 1;
      if (p.priority === 'HIGH' || p.priority === 'CRITICAL') acc.highPriority += 1;
      if (p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL') acc.highRisk += 1;
      return acc;
    },
    { inProgress: 0, completed: 0, onHold: 0, highPriority: 0, highRisk: 0 }
  );

  const columns: TableColumn<Project>[] = [
    {
      key: 'project_code',
      header: 'Code',
      render: (row) => row.project_code || row.id,
    },
    {
      key: 'name',
      header: 'Project',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900">{row.name}</div>
          {row.description && (
            <div className="text-[10px] text-slate-500 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.client}</div>
          {row.client_contact_person && (
            <div className="text-[10px] text-slate-500">{row.client_contact_person}</div>
          )}
        </div>
      ),
    },
    {
      key: 'project_type',
      header: 'Type',
      render: (row) => {
        const typeColors = {
          FIXED_PRICE: 'bg-blue-50 text-blue-700',
          TIME_MATERIALS: 'bg-purple-50 text-purple-700',
          HYBRID: 'bg-amber-50 text-amber-700',
          SUPPORT: 'bg-green-50 text-green-700',
          CONSULTING: 'bg-indigo-50 text-indigo-700',
          IMPLEMENTATION: 'bg-pink-50 text-pink-700',
          OTHER: 'bg-slate-50 text-slate-700',
        };
        const color = typeColors[row.project_type] || 'bg-slate-50 text-slate-700';
        return (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color} border`}>
            {row.project_type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const statusTone =
          row.status === 'COMPLETED'
            ? 'success'
            : row.status === 'IN_PROGRESS'
            ? 'brand'
            : row.status === 'ON_HOLD'
            ? 'warning'
            : row.status === 'CANCELLED'
            ? 'danger'
            : 'neutral';
        return <Badge tone={statusTone}>{row.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => {
        if (!row.priority) return <span className="text-[11px] text-slate-400">-</span>;
        const priorityColors = {
          LOW: 'text-emerald-700',
          MEDIUM: 'text-blue-700',
          HIGH: 'text-amber-700',
          CRITICAL: 'text-red-700',
        };
        const color = priorityColors[row.priority] || 'text-slate-700';
        return (
          <span className={`text-[11px] font-medium ${color}`}>
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'start_date',
      header: 'Timeline',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-slate-900">{row.start_date}</div>
          {row.end_date && (
            <div className="text-[10px] text-slate-500">End: {row.end_date}</div>
          )}
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) => {
        const spent = row.actual_cost || 0;
        const budget = row.budget || 0;
        const spentPercent = budget > 0 ? (spent / budget) * 100 : 0;
        const isOverBudget = spentPercent > 100;
        return (
          <div className="space-y-0.5">
            <div className="text-slate-900">
              {budget.toLocaleString(undefined, { style: 'currency', currency: row.currency || 'USD' })}
            </div>
            {spent > 0 && (
              <div className={`text-[10px] ${isOverBudget ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                Spent: {spentPercent.toFixed(0)}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'progress_percentage',
      header: 'Progress',
      render: (row) => {
        const progress = row.progress_percentage || row.completion_percentage || 0;
        const progressColor =
          progress >= 90
            ? 'text-emerald-700'
            : progress >= 50
            ? 'text-blue-700'
            : progress >= 25
            ? 'text-amber-700'
            : 'text-red-700';
        return (
          <div className="space-y-0.5">
            <div className={`text-[11px] font-semibold ${progressColor}`}>
              {progress}%
            </div>
            {row.tasks_total && (
              <div className="text-[10px] text-slate-500">
                {row.tasks_completed || 0}/{row.tasks_total} tasks
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingProject(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProject) {
      await update(editingProject.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Project Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage service and resource projects, track timelines, budgets, progress, and client deliverables across all project types.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
        >
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Projects"
          value={metrics.totalProjects.toString()}
          helper="All projects in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="In Progress"
          value={metrics.activeProjects.toString()}
          helper="Currently active."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Completed"
          value={metrics.completedProjects.toString()}
          helper="Successfully delivered."
          trend="up"
          variant="purple"
        />
        <StatCard
          label="Total Budget"
          value={metrics.totalBudget.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="Across all projects."
          trend="up"
          variant="yellow"
        />
        <StatCard
          label="Active Budget"
          value={metrics.activeBudget.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="Planning & in progress."
          trend="flat"
          variant="yellow"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">On Hold</p>
          <p className="text-2xl font-bold text-slate-900">
            {metrics.onHoldProjects.toString()}
          </p>
          <p className="text-[11px] text-slate-500">Projects temporarily paused</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">High Priority</p>
          <p className="text-2xl font-bold text-slate-900">
            {metricsByStatus.highPriority}
          </p>
          <p className="text-[11px] text-slate-500">High/Critical priority projects</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">High Risk</p>
          <p className="text-2xl font-bold text-slate-900">
            {metricsByStatus.highRisk}
          </p>
          <p className="text-[11px] text-slate-500">Projects requiring attention</p>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'all', label: 'All Projects' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'on_hold', label: 'On Hold' },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'in_progress' | 'completed' | 'on_hold');
            setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by project name, code, client, manager, contract #, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState label="Loading projects..." />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first project to get started.'
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedProjects}
                getRowKey={(row, index) => `${row.id}-${index}`}
              />
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Select
                  value={itemsPerPage.toString()}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-32"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </Select>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'New Project'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
      >
        <ProjectForm
          initial={editingProject || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
        />
      </Modal>
    </div>
  );
}
