import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  createCategory, 
  updateCategory, 
  listVendors, 
  type CategoryPayload,
  type Vendor 
} from '../api/inventoryApi';

export interface CategoryFormData {
  id?: number;
  category_name: string;
  vendor_id: number;
  description?: string;
}

type Props = {
  initial?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  onCancel?: () => void;
};

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [categoryName, setCategoryName] = useState(initial?.category_name ?? '');
  const [vendorId, setVendorId] = useState<number | ''>(initial?.vendor_id ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        const vendorList = await listVendors();
        setVendors(vendorList);
        // Set default vendor if not already set
        if (!initial?.vendor_id && vendorList.length > 0) {
          setVendorId(vendorList[0].id);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendors');
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, [initial?.vendor_id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName || !vendorId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: CategoryPayload = {
      category_name: categoryName,
      vendor_id: Number(vendorId),
      description: description || undefined
    };

    try {
      if (initial?.id) {
        // Update existing category
        const updatedCategory = await updateCategory(initial.id, payload);
        onSubmit({
          id: updatedCategory.id,
          category_name: updatedCategory.category_name,
          vendor_id: updatedCategory.vendor_id,
          description: updatedCategory.description
        });
      } else {
        // Create new category
        const newCategory = await createCategory(payload);
        onSubmit({
          id: newCategory.id,
          category_name: newCategory.category_name,
          vendor_id: newCategory.vendor_id,
          description: newCategory.description
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Category Information</h3>
        
        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px]">
            {error}
          </div>
        )}

        <Input
          label="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          required
        />
        <Select
          label="Vendor"
          value={vendorId.toString()}
          onChange={(e) => setVendorId(e.target.value ? Number(e.target.value) : '')}
          disabled={vendorsLoading}
          required
        >
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id.toString()}>
              {vendor.vendor_name} - {vendor.contact_person_name}
            </option>
          ))}
        </Select>
        <Input
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter category description"
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isLoading || vendorsLoading} className="w-full sm:w-auto">
          {isLoading ? 'Saving...' : initial?.id ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
