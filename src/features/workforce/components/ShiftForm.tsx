import { FormEvent, useState } from 'react';
import type { Shift } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Shift>;
  onSubmit: (values: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function ShiftForm({ initial, onSubmit }: Props) {
  const [employeeName, setEmployeeName] = useState(initial?.employee_name ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(initial?.start_time ?? '08:00');
  const [endTime, setEndTime] = useState(initial?.end_time ?? '16:00');
  const [role, setRole] = useState(initial?.role ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!employeeName || !date) return;
    onSubmit({
      employee_name: employeeName,
      date,
      start_time: startTime,
      end_time: endTime,
      role
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Shift details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Employee"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee name"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Start time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <Input
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role for this shift"
          />
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save shift
        </Button>
      </div>
    </form>
  );
}


