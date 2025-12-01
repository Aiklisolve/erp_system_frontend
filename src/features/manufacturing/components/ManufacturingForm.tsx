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
};

export function ManufacturingForm({ initial, onSubmit }: Props) {
  const [product, setProduct] = useState(initial?.product ?? '');
  const [plannedQty, setPlannedQty] = useState(initial?.planned_qty ?? 0);
  const [status, setStatus] = useState<ProductionOrderStatus>(
    initial?.status ?? 'PLANNED'
  );
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!product || !plannedQty) return;
    onSubmit({
      product,
      planned_qty: Number(plannedQty),
      status,
      start_date: startDate,
      end_date: endDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Configurable assembly or SKU"
          />
          <Input
            label="Planned quantity"
            type="number"
            value={plannedQty}
            onChange={(e) => setPlannedQty(Number(e.target.value))}
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
            onChange={(e) => setStatus(e.target.value as ProductionOrderStatus)}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save production order
        </Button>
      </div>
    </form>
  );
}


