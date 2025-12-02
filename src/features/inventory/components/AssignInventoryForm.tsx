import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';

export interface AssignInventoryFormData {
  product_id: string;
  vendor_id: string;
  vehicle_id: string;
  product_quantity: number;
  created_by: string;
  updated_by: string;
  dateOfUse: string;
  reasonNotes: string;
}

type Props = {
  initial?: AssignInventoryFormData;
  onSubmit: (data: AssignInventoryFormData) => void;
  onCancel?: () => void;
};

// Static mock data for fallback
const mockVehicles = [
  { vehicle_id: 1, registration_number: 'VH-001', vehicle_model: 'Truck Model A' },
  { vehicle_id: 2, registration_number: 'VH-002', vehicle_model: 'Van Model B' },
  { vehicle_id: 3, registration_number: 'TRK-001', vehicle_model: 'Truck Model C' },
];

const mockProducts = [
  { product_id: 1, product_name: 'Engine Oil Filter', part_number: 'PN-001', available_quantity: 50 },
  { product_id: 2, product_name: 'Brake Pads', part_number: 'PN-002', available_quantity: 30 },
  { product_id: 3, product_name: 'Air Filter', part_number: 'PN-003', available_quantity: 25 },
];

export function AssignInventoryForm({ initial, onSubmit, onCancel }: Props) {
  const [productId, setProductId] = useState(initial?.product_id ?? '');
  const [vendorId, setVendorId] = useState(initial?.vendor_id ?? '');
  const [vehicleId, setVehicleId] = useState(initial?.vehicle_id ?? '');
  const [productQuantity, setProductQuantity] = useState<number | ''>(initial?.product_quantity ?? '');
  const [dateOfUse, setDateOfUse] = useState(initial?.dateOfUse ?? new Date().toISOString().slice(0, 10));
  const [reasonNotes, setReasonNotes] = useState(initial?.reasonNotes ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const [vehicles, setVehicles] = useState(mockVehicles);
  const [products, setProducts] = useState(mockProducts);
  const [selectedProductQuantity, setSelectedProductQuantity] = useState<number | null>(null);
  const [quantityWarning, setQuantityWarning] = useState('');

  // Fetch vehicles and products from API (optional)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
        if (API_KEY) {
          // Fetch vehicles
          try {
            const vehicleResponse = await fetch(
              "https://n8n.srv799538.hstgr.cloud/webhook/5397517f-8d9a-493f-9365-ad74381b20b2",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  apikey: API_KEY,
                  Authorization: `Bearer ${API_KEY}`,
                  "Content-Profile": "srtms",
                  jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                  session_id: "1",
                },
              }
            );
            if (vehicleResponse.ok) {
              const vehicleData = await vehicleResponse.json();
              if (Array.isArray(vehicleData)) {
                setVehicles(vehicleData);
              }
            }
          } catch (error) {
            console.log('Vehicle API failed, using mock data:', error);
          }

          // Fetch products
          try {
            const productResponse = await fetch(
              "https://n8n.srv799538.hstgr.cloud/webhook/e69a0b74-7a9a-4e8b-aa7d-4d55f003df3d",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  apikey: API_KEY,
                  Authorization: `Bearer ${API_KEY}`,
                  "Content-Profile": "srtms",
                  jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                  session_id: "1",
                },
              }
            );
            if (productResponse.ok) {
              const productData = await productResponse.json();
              if (Array.isArray(productData)) {
                setProducts(productData);
              }
            }
          } catch (error) {
            console.log('Product API failed, using mock data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update available quantity when product is selected
  useEffect(() => {
    if (productId) {
      const selectedProduct = products.find(p => p.product_id.toString() === productId);
      if (selectedProduct) {
        setSelectedProductQuantity(selectedProduct.available_quantity || null);
        // Auto-select part number if available
        if (selectedProduct.part_number) {
          setVendorId(selectedProduct.part_number);
        }
      } else {
        setSelectedProductQuantity(null);
      }
    } else {
      setSelectedProductQuantity(null);
    }
  }, [productId, products]);

  // Check quantity warning
  useEffect(() => {
    if (selectedProductQuantity !== null && productQuantity && Number(productQuantity) > selectedProductQuantity) {
      setQuantityWarning(`⚠️ Warning: You are requesting ${productQuantity} items, but only ${selectedProductQuantity} are available.`);
    } else {
      setQuantityWarning('');
    }
  }, [productQuantity, selectedProductQuantity]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId || !vehicleId || !productQuantity || !dateOfUse || !reasonNotes) {
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
            "https://n8n.srv799538.hstgr.cloud/webhook/product_usage_master",
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
                product_id: productId,
                vendor_id: vendorId,
                vehicle_id: vehicleId,
                product_quantity: Number(productQuantity),
                created_by: 'Admin',
                updated_by: 'Admin',
                date_of_use: dateOfUse,
                reason_notes: reasonNotes,
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
        product_id: productId,
        vendor_id: vendorId,
        vehicle_id: vehicleId,
        product_quantity: Number(productQuantity),
        created_by: 'Admin',
        updated_by: 'Admin',
        dateOfUse,
        reasonNotes,
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
        <h3 className="text-sm font-semibold text-slate-900">Assignment Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.product_id} value={product.product_id.toString()}>
                {product.product_name} ({product.part_number}) - Qty: {product.available_quantity}
              </option>
            ))}
          </Select>
          <Select
            label="Vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          >
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.vehicle_id} value={vehicle.vehicle_id.toString()}>
                {vehicle.registration_number} - {vehicle.vehicle_model}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Part Number"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="Auto-filled from product"
            readOnly
          />
          <Input
            label="Quantity"
            type="number"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter quantity"
            min={1}
            max={selectedProductQuantity || undefined}
            required
          />
        </div>
        {quantityWarning && (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
            {quantityWarning}
          </div>
        )}
        {selectedProductQuantity !== null && (
          <p className="text-[11px] text-slate-500">
            Available quantity: <span className="font-semibold">{selectedProductQuantity}</span>
          </p>
        )}
        <Input
          label="Date of Use"
          type="date"
          value={dateOfUse}
          onChange={(e) => setDateOfUse(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          required
        />
        <Textarea
          label="Reason/Notes"
          value={reasonNotes}
          onChange={(e) => setReasonNotes(e.target.value)}
          placeholder="Enter reason or notes for this assignment"
          rows={3}
          required
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Assigning...' : 'Assign Inventory'}
        </Button>
      </div>
    </form>
  );
}
