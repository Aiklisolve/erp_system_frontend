import { FormEvent, useState } from 'react';
import type { InventoryItem } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<InventoryItem>;
  onSubmit: (
    values: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
  ) => void;
};

const CATEGORIES = ['Software', 'Hardware', 'Services', 'Accessories'];

export function InventoryForm({ initial, onSubmit }: Props) {
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [qtyOnHand, setQtyOnHand] = useState(initial?.qty_on_hand ?? 0);
  const [reorderLevel, setReorderLevel] = useState(initial?.reorder_level ?? 0);
  const [location, setLocation] = useState(initial?.location ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;
    onSubmit({
      sku,
      name,
      category,
      qty_on_hand: Number(qtyOnHand),
      reorder_level: Number(reorderLevel),
      location
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU-0001"
          />
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item description"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Warehouse / bin"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quantities</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Quantity on hand"
            type="number"
            value={qtyOnHand}
            onChange={(e) => setQtyOnHand(Number(e.target.value))}
          />
          <Input
            label="Reorder level"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 -mx-4 border-t border-slate-200 bg-white px-4 pt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="md">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Save item
        </Button>
      </div>
    </form>
  );
}


