import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export interface CategoryFormData {
  category_id?: number;
  category_name: string;
  vendor_id: number;
  created_by?: string;
  updated_by?: string;
}

type Props = {
  initial?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  onCancel?: () => void;
};

// Static mock categories and vendors for fallback
const mockCategories: CategoryFormData[] = [
  { category_id: 1, category_name: 'Electronics', vendor_id: 1 },
  { category_id: 2, category_name: 'Tools', vendor_id: 1 },
  { category_id: 3, category_name: 'Safety Equipment', vendor_id: 1 },
];

const mockVendors = [
  { vendor_id: 1, company_name: 'ABC Electronics Ltd', contact_person_name: 'John Doe' },
  { vendor_id: 2, company_name: 'XYZ Auto Parts', contact_person_name: 'Jane Smith' },
  { vendor_id: 3, company_name: 'Global Tools Inc', contact_person_name: 'Bob Johnson' },
];

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [categoryName, setCategoryName] = useState(initial?.category_name ?? '');
  const [vendorId, setVendorId] = useState<number>(initial?.vendor_id ?? mockVendors[0]?.vendor_id ?? 1);
  const [vendors, setVendors] = useState(mockVendors);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // Fetch vendors from API (optional)
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
        if (API_KEY) {
          const response = await fetch(
            "https://n8n.srv799538.hstgr.cloud/webhook/vendor",
            {
              method: 'GET',
              headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'content-Profile': 'srtms',
                'session_id': '1',
                'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0]?.status === 'success' && data[0]?.data) {
              const activeVendors = data[0].data.filter((v: any) => !v.deleted_flag);
              setVendors(activeVendors.map((v: any) => ({
                vendor_id: v.vendor_id,
                company_name: v.company_name,
                contact_person_name: v.contact_person_name,
              })));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        // Use mock vendors on error
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName || !vendorId) {
      return;
    }

    setIsLoading(true);
    try {
      // Try Supabase API first (optional)
      const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
      const hasApiConfig = !!API_KEY;

      if (hasApiConfig) {
        try {
          const response = await fetch(
            "https://n8n.srv799538.hstgr.cloud/webhook/Category",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                "Content-Profile": "srtms",
                jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                session_id: "1",
              },
              body: JSON.stringify({
                category_id: initial?.category_id || mockCategories.length + 1,
                category_name: categoryName,
                created_by: 'Admin',
                updated_by: 'Admin',
              }),
            }
          );

          if (response.ok) {
            // Success - continue with onSubmit
          }
        } catch (error) {
          console.log('API call failed, using static data:', error);
        }
      }

      // Submit with static data fallback
      onSubmit({
        category_id: initial?.category_id || mockCategories.length + 1,
        category_name: categoryName,
        vendor_id: vendorId,
        created_by: 'Admin',
        updated_by: 'Admin',
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Category Information</h3>
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
          onChange={(e) => setVendorId(Number(e.target.value))}
          disabled={vendorsLoading}
        >
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.vendor_id} value={vendor.vendor_id.toString()}>
              {vendor.company_name} - {vendor.contact_person_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isLoading || vendorsLoading} className="w-full sm:w-auto">
          {isLoading ? 'Creating...' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
