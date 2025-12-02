import { FormEvent, useState } from 'react';
import type { Employee, EmployeeStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Employee>;
  onSubmit: (values: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function EmployeeForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [status, setStatus] = useState<EmployeeStatus>(
    initial?.status ?? 'ACTIVE'
  );
  const [joinDate, setJoinDate] = useState(
    initial?.join_date ?? new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      role,
      department,
      status,
      join_date: joinDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Employee details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
          <Input
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Job title"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Finance, HR, Operations"
          />
          <Input
            label="Join date"
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Status</h3>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On leave</option>
        </Select>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save employee
        </Button>
      </div>
    </form>
  );
}



