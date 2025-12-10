import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useToast } from '../../../hooks/useToast';
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
  const { showToast } = useToast();
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

  // Get unique values for filters (filter out undefined/null values)
  const statuses = Array.from(new Set(projects.map((p) => p.status).filter(Boolean)));
  const types = Array.from(new Set(projects.map((p) => p.project_type).filter(Boolean)));
  const priorities = Array.from(new Set(projects.map((p) => p.priority).filter(Boolean)));

  // Calculate metrics
  const metricsByStatus = projects.reduce(
    (acc, p) => {
      if (p.status === 'IN_PROGRESS') acc.inProgress += 1;
      if (p.status === 'COMPLETED') acc.completed += 1;
      if (p.status === 'ON_HOLD') acc.onHold += 1;
      if (p.status === 'PLANNING') acc.planning += 1;
      if (p.priority === 'HIGH' || p.priority === 'CRITICAL') acc.highPriority += 1;
      if (p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL') acc.highRisk += 1;
      return acc;
    },
    { inProgress: 0, completed: 0, onHold: 0, planning: 0, highPriority: 0, highRisk: 0 }
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
            {row.project_type ? String(row.project_type).replace('_', ' ') : '-'}
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
        return <Badge tone={statusTone}>{row.status ? String(row.status).replace('_', ' ') : '-'}</Badge>;
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
              ₹{budget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
            onClick={() => handleDelete(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingProject) {
        await update(editingProject.id, data);
        showToast('success', 'Project Updated', `Project "${data.name}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Project Created', `Project "${data.name}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await remove(project.id);
        showToast('success', 'Project Deleted', `Project "${project.name}" has been deleted successfully.`);
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete project. Please try again.');
      }
    }
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Projects"
          value={metrics.totalProjects.toString()}
          helper="All projects in system."
          trend="up"
          variant="indigo"
        />
        <StatCard
          label="In Progress"
          value={metrics.activeProjects.toString()}
          helper="Currently active."
          trend="up"
          variant="cyan"
        />
        <StatCard
          label="Completed"
          value={metrics.completedProjects.toString()}
          helper="Successfully delivered."
          trend="up"
          variant="green"
        />
        <StatCard
          label="Total Budget"
          value={`₹${metrics.totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          helper="Across all projects."
          trend="up"
          variant="yellow"
        />
        <StatCard
          label="Active Budget"
          value={`₹${metrics.activeBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          helper="Planning & in progress."
          trend="flat"
          variant="orange"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-2 bg-gradient-to-br from-orange-50 via-white to-orange-100 border-orange-200">
          <p className="text-xs font-semibold text-orange-700">On Hold</p>
          <p className="text-2xl font-bold text-orange-700">
            {metrics.onHoldProjects.toString()}
          </p>
          <p className="text-[11px] text-orange-600">Projects temporarily paused</p>
        </Card>
        <Card className="space-y-2 bg-gradient-to-br from-red-50 via-white to-red-100 border-red-200">
          <p className="text-xs font-semibold text-red-700">High Priority</p>
          <p className="text-2xl font-bold text-red-700">
            {metricsByStatus.highPriority}
          </p>
          <p className="text-[11px] text-red-600">High/Critical priority projects</p>
        </Card>
        <Card className={`space-y-2 ${metricsByStatus.highRisk > 0 
          ? 'bg-gradient-to-br from-red-50 via-white to-red-100 border-red-200' 
          : 'bg-gradient-to-br from-purple-50 via-white to-purple-100 border-purple-200'}`}>
          <p className={`text-xs font-semibold ${metricsByStatus.highRisk > 0 ? 'text-red-700' : 'text-purple-700'}`}>
            {metricsByStatus.highRisk > 0 ? 'High Risk' : 'Planning'}
          </p>
          <p className={`text-2xl font-bold ${metricsByStatus.highRisk > 0 ? 'text-red-700' : 'text-purple-700'}`}>
            {metricsByStatus.highRisk > 0 ? metricsByStatus.highRisk : metricsByStatus.planning}
          </p>
          <p className={`text-[11px] ${metricsByStatus.highRisk > 0 ? 'text-red-600' : 'text-purple-600'}`}>
            {metricsByStatus.highRisk > 0 
              ? 'Projects requiring attention' 
              : 'Projects in planning phase'}
          </p>
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
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <Input
              placeholder="Search by project name, code, client, manager, contract #, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status ? String(status).replace('_', ' ') : '-'}
                </option>
              ))}
            </Select>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type ? String(type).replace(/_/g, ' ') : '-'}
                </option>
              ))}
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </div>
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
            {/* Pagination */}
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Left: Page size selector */}
                <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-center sm:justify-start">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>

                {/* Center: Page numbers */}
                <div className="flex-1 flex justify-center w-full sm:w-auto">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>

                {/* Right: Showing info */}
                <div className="text-xs text-slate-600 whitespace-nowrap text-center sm:text-left">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProjects.length)}</span> of <span className="font-medium text-slate-900">{filteredProjects.length}</span>
                </div>
              </div>
            </div>
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
        hideCloseButton
      >
        <ProjectForm
          key={editingProject?.id || 'new-project'}
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
