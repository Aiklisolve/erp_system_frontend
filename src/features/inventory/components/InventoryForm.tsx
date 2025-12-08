import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { listCategories, type Category } from '../api/inventoryApi';
import type { InventoryItem } from '../types';

type Props = {
  initial?: Partial<InventoryItem>;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
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

export function InventoryForm({ initial, onSubmit, onCancel, isLoading = false }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [qtyOnHand, setQtyOnHand] = useState<number | ''>(initial?.qty_on_hand ?? '');
  const [reorderLevel, setReorderLevel] = useState<number | ''>(initial?.reorder_level ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [error, setError] = useState<string | null>(null);
  
  // Categories from backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoryList = await listCategories();
        setCategories(categoryList);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get category options - combine backend categories with static fallbacks
  const categoryOptions = categories.length > 0 
    ? categories.map(c => c.category_name)
    : mockCategories;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !category || qtyOnHand === '' || reorderLevel === '' || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);

    // Pass data to parent - the hook will handle the API call
    onSubmit({
      sku: initial?.sku || '', // Keep existing SKU for edits, empty for new (auto-generated)
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
        
        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px]">
            {error}
          </div>
        )}

        {initial?.sku && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
            <span className="font-medium">SKU:</span> {initial.sku}
          </div>
        )}

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          required
        />
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={categoriesLoading}
          required
        >
          <option value="">Select category</option>
          {categoryOptions.map((cat) => (
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
        <Button type="submit" variant="primary" size="md" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Saving...' : initial?.id ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
