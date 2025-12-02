import { FormEvent, useState } from 'react';
import type { Customer } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Customer>;
  onSubmit: (values: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
};

const SEGMENTS = ['Enterprise', 'Mid-market', 'SMB', 'Education', 'Non-profit'];

export function CustomerForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [segment, setSegment] = useState(initial?.segment ?? SEGMENTS[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      email,
      phone,
      segment
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Customer details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer organisation name"
          />
          <Input
            label="Segment"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="e.g. Enterprise"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="primary contact email"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0100"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Segment</h3>
        <Select
          label="Segment"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
        >
          {SEGMENTS.map((seg) => (
            <option key={seg} value={seg}>
              {seg}
            </option>
          ))}
        </Select>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save customer
        </Button>
      </div>
    </form>
  );
}



