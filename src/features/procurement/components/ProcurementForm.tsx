import { FormEvent, useState } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<PurchaseOrder>;
  onSubmit: (values: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function ProcurementForm({ initial, onSubmit }: Props) {
  const [supplier, setSupplier] = useState(initial?.supplier ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<PurchaseOrderStatus>(
    initial?.status ?? 'DRAFT'
  );
  const [totalAmount, setTotalAmount] = useState(initial?.total_amount ?? 0);

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
            placeholder="Acme Components"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Amounts & status</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total amount (USD)"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
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

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save purchase order
        </Button>
      </div>
    </form>
  );
}


