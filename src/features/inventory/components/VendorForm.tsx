import { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

export interface VendorFormData {
  id?: number;
  category_name: string;
  phone_number: string;
  email_id: string;
  contact_person_name: string;
  address: string;
  materials_products: string;
  created_by?: string;
  updated_by?: string;
}

type Props = {
  initial?: VendorFormData;
  onSubmit: (data: VendorFormData) => void;
  onCancel?: () => void;
};

// Static mock vendors for fallback
const mockVendors: VendorFormData[] = [
  {
    id: 1,
    category_name: 'ABC Electronics Ltd',
    phone_number: '9876543210',
    email_id: 'contact@abcelectronics.com',
    contact_person_name: 'John Doe',
    address: '123 Industrial Area, City',
    materials_products: 'Electronic components, Circuit boards'
  }
];

export function VendorForm({ initial, onSubmit, onCancel }: Props) {
  const [vendorName, setVendorName] = useState(initial?.category_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(initial?.phone_number ?? '');
  const [emailId, setEmailId] = useState(initial?.email_id ?? '');
  const [contactPerson, setContactPerson] = useState(initial?.contact_person_name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [materialsProducts, setMaterialsProducts] = useState(initial?.materials_products ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorName || !phoneNumber || !emailId || !contactPerson || !address || !materialsProducts) {
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
            "https://n8n.srv799538.hstgr.cloud/webhook/vendor_add",
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
                category_name: vendorName,
                phone_number: phoneNumber,
                email_id: emailId,
                contact_person_name: contactPerson,
                address: address,
                materials_products: materialsProducts,
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
        id: initial?.id || mockVendors.length + 1,
        category_name: vendorName,
        phone_number: phoneNumber,
        email_id: emailId,
        contact_person_name: contactPerson,
        address: address,
        materials_products: materialsProducts,
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
        <h3 className="text-sm font-semibold text-slate-900">Vendor Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Vendor Name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            placeholder="Enter vendor name"
            required
          />
          <Input
            label="Contact Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const numeric = e.target.value.replace(/\D/g, '');
              setPhoneNumber(numeric.slice(0, 10));
            }}
            placeholder="Enter contact number"
            maxLength={10}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Contact Person Name"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Enter contact person name"
            required
          />
        </div>
        <Textarea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete address"
          rows={3}
          required
        />
        <Textarea
          label="Materials/Products"
          value={materialsProducts}
          onChange={(e) => setMaterialsProducts(e.target.value)}
          placeholder="Enter materials or products supplied"
          rows={3}
          required
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Adding...' : initial ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  );
}
