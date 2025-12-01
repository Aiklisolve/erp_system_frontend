import { useState } from 'react';
import { useWorkforce } from '../hooks/useWorkforce';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import type { Shift } from '../types';
import { ShiftForm } from './ShiftForm';

export function WorkforceList() {
  const { shifts, loading, create, remove, metrics } = useWorkforce();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: TableColumn<Shift>[] = [
    { key: 'date', header: 'Date' },
    { key: 'employee_name', header: 'Employee' },
    { key: 'role', header: 'Role' },
    { key: 'start_time', header: 'Start' },
    { key: 'end_time', header: 'End' },
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
            Workforce Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Visualize demo shifts and coverage across days to illustrate operational
            planning.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          New shift
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total shifts"
          value={metrics.totalShifts.toString()}
          helper="Planned in this view."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Days with coverage"
          value={metrics.daysCovered.toString()}
          helper="Unique days with at least one shift."
          trend="flat"
          variant="blue"
        />
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Shifts
          </h2>
          {loading && <LoadingState label="Loading shifts..." />}
        </div>
        {shifts.length === 0 && !loading ? (
          <EmptyState
            title="No shifts yet"
            description="Create your first demo shift to see it here."
          />
        ) : (
          <Table
            columns={columns}
            data={shifts}
            getRowKey={(row, index) => `${row.id}-${index}`}
            emptyMessage="No shifts found."
          />
        )}
      </Card>

      <Modal
        title="New shift"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ShiftForm
          onSubmit={(values) => {
            void create(values);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

