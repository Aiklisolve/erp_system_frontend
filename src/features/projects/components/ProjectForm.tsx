import { FormEvent, useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Project>;
  onSubmit: (values: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
};

const STATUSES: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export function ProjectForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [client, setClient] = useState(initial?.client ?? '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'PLANNING');
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    initial?.end_date ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [budget, setBudget] = useState(initial?.budget ?? 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || budget < 0) return;
    onSubmit({
      name,
      client,
      status,
      start_date: startDate,
      end_date: endDate,
      budget: Number(budget)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Project Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., ERP System Implementation"
          />
          <Input
            label="Client name"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="e.g., Acme Corporation"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Timeline & Status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Budget</h3>
        <div className="grid gap-4 sm:grid-cols-1">
          <Input
            label="Budget (USD)"
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            placeholder="e.g., 125000"
          />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-slate-200 p-4 flex justify-end gap-2 -mx-6 -mb-6 mt-auto">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Project
        </Button>
      </div>
    </form>
  );
}

