import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Project } from '../types';
import { ProjectForm } from './ProjectForm';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { Badge } from '../../../components/ui/Badge';

export function ProjectList() {
  const { projects, loading, create, remove, metrics } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Project>[] = [
    { key: 'name', header: 'Project name' },
    { key: 'client', header: 'Client' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'COMPLETED'
              ? 'success'
              : row.status === 'IN_PROGRESS'
              ? 'brand'
              : row.status === 'ON_HOLD'
              ? 'warning'
              : row.status === 'CANCELLED'
              ? 'danger'
              : 'neutral'
          }
        >
          {row.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      )
    },
    { key: 'start_date', header: 'Start date' },
    { key: 'end_date', header: 'End date' },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) =>
        row.budget.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(row.id)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Project Management"
          description="Manage your service and resource projects, track timelines, budgets, and client deliverables. In production this would be backed by the `projects` table in Supabase."
        />
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          New project
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total projects"
          value={metrics.totalProjects.toString()}
          helper="All projects in system."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active projects"
          value={metrics.activeProjects.toString()}
          helper="Currently in progress."
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
          label="Total budget"
          value={metrics.totalBudget.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD'
          })}
          helper="Across all projects."
          trend="up"
          variant="yellow"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-text-secondary">Active Budget</p>
          <p className="text-2xl font-bold text-text-primary">
            {metrics.activeBudget.toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD'
            })}
          </p>
          <p className="text-[11px] text-text-secondary">
            Projects in planning or in progress
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold text-text-secondary">On Hold</p>
          <p className="text-2xl font-bold text-text-primary">
            {metrics.onHoldProjects.toString()}
          </p>
          <p className="text-[11px] text-text-secondary">Projects temporarily paused</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Projects</h2>
          {loading && <LoadingState label="Loading projects..." />}
        </div>
        {projects.length === 0 && !loading ? (
          <EmptyState
            title="No projects yet"
            description="Create your first demo project to see it appear here."
          />
        ) : (
          <Table
            columns={columns}
            data={projects}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No projects found."
          />
        )}
      </Card>

      <Modal
        title="New project"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ProjectForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
