import { useState } from 'react';
import { useHr } from '../hooks/useHr';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Employee } from '../types';
import { EmployeeForm } from './EmployeeForm';

export function EmployeeList() {
  const { employees, loading, create, remove, metrics } = useHr();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Employee>[] = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const color =
          row.status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700'
            : row.status === 'ON_LEAVE'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-slate-100 text-slate-700';
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}
          >
            {row.status.replace('_', ' ')}
          </span>
        );
      }
    },
    { key: 'join_date', header: 'Joined' },
    {
      key: 'id',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => remove(row.id)}
          className="text-[11px] text-red-500 hover:text-red-600"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            HR Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Manage demo employees and see a quick breakdown of active staff and people on
            leave.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New employee
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total employees"
          value={metrics.total.toString()}
          helper="In this demo tenant."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Active"
          value={metrics.active.toString()}
          helper="Currently active contracts."
          trend="up"
          variant="blue"
        />
        <StatCard
          label="On leave"
          value={metrics.onLeave.toString()}
          helper="On approved absence."
          trend={metrics.onLeave > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Employees
          </h2>
          {loading && <LoadingState label="Loading employees..." />}
        </div>
        {employees.length === 0 && !loading ? (
          <EmptyState
            title="No employees yet"
            description="Create your first demo employee to see them here."
          />
        ) : (
          <Table
            columns={columns}
            data={employees}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No employees found."
          />
        )}
      </Card>

      <Modal
        title="New employee"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <EmployeeForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

