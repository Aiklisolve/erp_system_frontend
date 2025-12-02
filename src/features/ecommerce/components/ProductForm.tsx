import { FormEvent, useState } from 'react';
import type { Product, ProductStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Product>;
  onSubmit: (values: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
};

export function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'ACTIVE');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || price < 0 || stock < 0) return;
    onSubmit({
      name,
      price: Number(price),
      stock: Number(stock),
      status
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Product Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Premium ERP License"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Pricing & Inventory</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <Input
            label="Stock quantity"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-slate-200 p-4 flex justify-end gap-2 -mx-6 -mb-6 mt-auto">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Product
        </Button>
      </div>
    </form>
  );
}

