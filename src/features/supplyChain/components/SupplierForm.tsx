import { FormEvent, useState } from 'react';
import type { Supplier } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Supplier>;
  onSubmit: (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function SupplierForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [contactPerson, setContactPerson] = useState(
    initial?.contact_person ?? ''
  );
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 4);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      contact_person: contactPerson,
      phone,
      rating: Number(rating)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Supplier details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Legal or trading name"
          />
          <Input
            label="Contact person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Primary contact"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0101"
          />
          <Input
            label="Rating (1–5)"
            type="number"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save supplier
        </Button>
      </div>
    </form>
  );
}


