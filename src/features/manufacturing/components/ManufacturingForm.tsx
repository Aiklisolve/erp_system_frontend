import { FormEvent, useState } from 'react';
import type {
  ProductionOrder,
  ProductionOrderStatus
} from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<ProductionOrder>;
  onSubmit: (
    values: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>
  ) => void;
  onCancel?: () => void;
};

export function ManufacturingForm({ initial, onSubmit, onCancel }: Props) {
  const [product, setProduct] = useState(initial?.product ?? '');
  const [plannedQty, setPlannedQty] = useState<number | ''>(initial?.planned_qty ?? '');
  const [cost, setCost] = useState<number | ''>(initial?.cost ?? '');
  const [status, setStatus] = useState<ProductionOrderStatus>(
    initial?.status ?? 'PLANNED'
  );
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!product || !plannedQty || !cost) return;
    onSubmit({
      product,
      planned_qty: Number(plannedQty),
      cost: Number(cost),
      status,
      start_date: startDate,
      end_date: endDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic info</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product name"
          />
          <Input
            label="Planned quantity"
            type="number"
            value={plannedQty}
            placeholder="Enter quantity"
            onChange={(e) => setPlannedQty(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <Input
            label="Cost (INR)"
            type="number"
            value={cost}
            placeholder="Enter cost"
            onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Schedule & status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            min={initial?.start_date ? undefined : new Date().toISOString().slice(0, 10)}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductionOrderStatus)}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          {initial ? 'Update production order' : 'Save production order'}
        </Button>
      </div>
    </form>
  );
}


