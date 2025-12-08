import { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { createVendor, updateVendor, type VendorPayload } from '../api/inventoryApi';

export interface VendorFormData {
  id?: number;
  vendor_name: string;
  phone_number: string;
  email: string;
  contact_person_name: string;
  address: string;
  materials_products: string;
}

type Props = {
  initial?: VendorFormData;
  onSubmit: (data: VendorFormData) => void;
  onCancel?: () => void;
};

export function VendorForm({ initial, onSubmit, onCancel }: Props) {
  const [vendorName, setVendorName] = useState(initial?.vendor_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(initial?.phone_number ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [contactPerson, setContactPerson] = useState(initial?.contact_person_name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [materialsProducts, setMaterialsProducts] = useState(initial?.materials_products ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorName || !phoneNumber || !email || !contactPerson || !address || !materialsProducts) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: VendorPayload = {
      vendor_name: vendorName,
      phone_number: phoneNumber,
      email: email,
      contact_person_name: contactPerson,
      address: address,
      materials_products: materialsProducts,
      is_active: true
    };

    try {
      if (initial?.id) {
        // Update existing vendor
        const updatedVendor = await updateVendor(initial.id, payload);
        onSubmit({
          id: updatedVendor.id,
          vendor_name: updatedVendor.vendor_name,
          phone_number: updatedVendor.phone_number,
          email: updatedVendor.email,
          contact_person_name: updatedVendor.contact_person_name,
          address: updatedVendor.address,
          materials_products: updatedVendor.materials_products
        });
      } else {
        // Create new vendor
        const newVendor = await createVendor(payload);
        onSubmit({
          id: newVendor.id,
          vendor_name: newVendor.vendor_name,
          phone_number: newVendor.phone_number,
          email: newVendor.email,
          contact_person_name: newVendor.contact_person_name,
          address: newVendor.address,
          materials_products: newVendor.materials_products
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save vendor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Vendor Information</h3>
        
        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px]">
            {error}
          </div>
        )}

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {isLoading ? 'Saving...' : initial?.id ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  );
}
