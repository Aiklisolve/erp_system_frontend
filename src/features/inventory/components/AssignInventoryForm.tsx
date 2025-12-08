import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import {
  createAssignment,
  listPurchaseOrders,
  listProducts,
  type AssignmentPayload,
  type PurchaseOrder,
  type Product
} from '../api/inventoryApi';

export interface AssignInventoryFormData {
  product_id: number;
  purchase_order_id: number;
  quantity: number;
  date_of_use: string;
  reason_notes: string;
}

type Props = {
  initial?: AssignInventoryFormData;
  onSubmit: (data: AssignInventoryFormData) => void;
  onCancel?: () => void;
};

export function AssignInventoryForm({ initial, onSubmit, onCancel }: Props) {
  const [productId, setProductId] = useState<number | ''>(initial?.product_id ?? '');
  const [purchaseOrderId, setPurchaseOrderId] = useState<number | ''>(initial?.purchase_order_id ?? '');
  const [quantity, setQuantity] = useState<number | ''>(initial?.quantity ?? '');
  const [dateOfUse, setDateOfUse] = useState(initial?.date_of_use ?? new Date().toISOString().slice(0, 10));
  const [reasonNotes, setReasonNotes] = useState(initial?.reason_notes ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch purchase orders and products from API
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [poList, productList] = await Promise.all([
          listPurchaseOrders(),
          listProducts()
        ]);
        setPurchaseOrders(poList);
        setProducts(productList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId || !purchaseOrderId || !quantity || !dateOfUse || !reasonNotes) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: AssignmentPayload = {
      product_id: Number(productId),
      purchase_order_id: Number(purchaseOrderId),
      quantity: Number(quantity),
      date_of_use: dateOfUse,
      reason_notes: reasonNotes
    };

    try {
      const newAssignment = await createAssignment(payload);
      onSubmit({
        product_id: newAssignment.product_id,
        purchase_order_id: newAssignment.purchase_order_id,
        quantity: newAssignment.quantity,
        date_of_use: newAssignment.date_of_use,
        reason_notes: newAssignment.reason_notes
      });
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Assignment Information</h3>
        
        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Product"
            value={productId.toString()}
            onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : '')}
            disabled={dataLoading}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id.toString()}>
                {product.name} ({product.product_code})
              </option>
            ))}
          </Select>
          <Select
            label="Purchase Order"
            value={purchaseOrderId.toString()}
            onChange={(e) => setPurchaseOrderId(e.target.value ? Number(e.target.value) : '')}
            disabled={dataLoading}
            required
          >
            <option value="">Select purchase order</option>
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.id.toString()}>
                {po.po_number} - {po.supplier_name} ({po.status})
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product Code"
            value={selectedProduct?.product_code ?? ''}
            placeholder="Auto-filled from product"
            readOnly
          />
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter quantity"
            min={1}
            required
          />
        </div>
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
        <Button type="submit" variant="primary" size="md" disabled={isLoading || dataLoading} className="w-full sm:w-auto">
          {isLoading ? 'Assigning...' : 'Assign Inventory'}
        </Button>
      </div>
    </form>
  );
}
