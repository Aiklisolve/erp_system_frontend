import { FormEvent, useState } from 'react';
import type { Customer } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Customer>;
  onSubmit: (values: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function CustomerForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [segment, setSegment] = useState(initial?.segment ?? 'Small Business');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Customer name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!phone.trim()) newErrors.phone = 'Phone is required';
    if (!segment.trim()) newErrors.segment = 'Segment is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit({
      name,
      email,
      phone,
      segment
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Customer Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              required
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@acme.com"
              required
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0101"
              required
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Segment <span className="text-red-500">*</span>
            </label>
            <Input
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Enterprise"
              required
            />
            {errors.segment && <p className="text-xs text-red-600 mt-1">{errors.segment}</p>}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
