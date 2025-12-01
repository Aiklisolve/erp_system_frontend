import { FormEvent, useState } from 'react';
import type { StockMovement } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<StockMovement>;
  onSubmit: (values: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>) => void;
};

export function WarehouseForm({ initial, onSubmit }: Props) {
  const [itemId, setItemId] = useState(initial?.item_id ?? '');
  const [fromLocation, setFromLocation] = useState(initial?.from_location ?? '');
  const [toLocation, setToLocation] = useState(initial?.to_location ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 0);
  const [movementDate, setMovementDate] = useState(
    initial?.movement_date ?? new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!itemId || !quantity) return;
    onSubmit({
      item_id: itemId,
      from_location: fromLocation,
      to_location: toLocation,
      quantity: Number(quantity),
      movement_date: movementDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Movement details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Item ID / SKU"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="SKU or internal item id"
          />
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Locations & date</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="From location"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder="Current bin or site"
          />
          <Input
            label="To location"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="Destination bin or site"
          />
          <Input
            label="Movement date"
            type="date"
            value={movementDate}
            onChange={(e) => setMovementDate(e.target.value)}
          />
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save movement
        </Button>
      </div>
    </form>
  );
}


