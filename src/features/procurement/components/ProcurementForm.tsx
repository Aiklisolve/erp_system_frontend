import { FormEvent, useState } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<PurchaseOrder>;
  onSubmit: (values: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function ProcurementForm({ initial, onSubmit, onCancel }: Props) {
  const [supplier, setSupplier] = useState(initial?.supplier ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<PurchaseOrderStatus>(
    initial?.status ?? 'DRAFT'
  );
  const [totalAmount, setTotalAmount] = useState<number | ''>(initial?.total_amount ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!supplier || !totalAmount) return;
    onSubmit({
      supplier,
      date,
      status,
      total_amount: Number(totalAmount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Supplier name"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            min={initial?.date ? undefined : new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Amounts & status</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total amount (INR)"
            type="number"
            value={totalAmount}
            placeholder="Enter amount"
            onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="RECEIVED">Received</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          {initial ? 'Update purchase order' : 'Save purchase order'}
        </Button>
      </div>
    </form>
  );
}


