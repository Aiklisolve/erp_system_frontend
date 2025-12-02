import { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { InventoryItem } from '../types';

type Props = {
  initial?: Partial<InventoryItem>;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Static mock categories for fallback
const mockCategories = [
  'Electronics',
  'Tools',
  'Safety Equipment',
  'Office Supplies',
  'Vehicle Parts',
  'Fuel',
  'Maintenance',
  'Other',
];

export function InventoryForm({ initial, onSubmit, onCancel }: Props) {
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [qtyOnHand, setQtyOnHand] = useState<number | ''>(initial?.qty_on_hand ?? '');
  const [reorderLevel, setReorderLevel] = useState<number | ''>(initial?.reorder_level ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !category || qtyOnHand === '' || reorderLevel === '' || !location) {
      return;
    }

    onSubmit({
      sku,
      name,
      category,
      qty_on_hand: Number(qtyOnHand),
      reorder_level: Number(reorderLevel),
      location,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g., SKU-1001"
            required
          />
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            required
          />
        </div>
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {mockCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Stock Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Quantity on Hand"
            type="number"
            value={qtyOnHand}
            onChange={(e) => setQtyOnHand(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Current stock"
            min={0}
            required
          />
          <Input
            label="Reorder Level"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Minimum stock level"
            min={0}
            required
          />
        </div>
        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., WH-01-A, Main DC"
          required
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
