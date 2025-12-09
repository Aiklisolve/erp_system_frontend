import { FormEvent, useState, useEffect } from 'react';
import type { StockMovement, MovementType, MovementStatus, WarehouseZone } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { listProducts, type Product } from '../../inventory/api/inventoryApi';
import { apiRequest } from '../../../config/api';

type Props = {
  initial?: Partial<StockMovement>;
  onSubmit: (values: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Mock locations for dropdowns
const mockLocations = [
  'WH-01-A', 'WH-01-B', 'WH-02-A', 'WH-02-B',
  'Main DC', 'Store-01', 'Store-02', 'Store-03',
  'Distribution Center', 'Regional Warehouse',
];

const mockZones: WarehouseZone[] = [
  'RECEIVING', 'STORAGE', 'PICKING', 'PACKING', 'SHIPPING', 'QUARANTINE'
];

// Determine if movement is going OUT (reduces stock)
function isOutMovement(movementType: MovementType): boolean {
  return ['SHIPMENT', 'TRANSFER'].includes(movementType) || 
         movementType === 'ADJUSTMENT'; // Adjustments can be negative
}

// Determine if movement is coming IN (increases stock)
function isInMovement(movementType: MovementType): boolean {
  return ['RECEIPT'].includes(movementType);
}

export function WarehouseForm({ initial, onSubmit, onCancel }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const [selectedProductId, setSelectedProductId] = useState<number | ''>(
    initial?.item_id ? (typeof initial.item_id === 'string' ? parseInt(initial.item_id) : initial.item_id) || '' : ''
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [loadingStock, setLoadingStock] = useState(false);
  
  const [movementType, setMovementType] = useState<MovementType>(initial?.movement_type ?? 'TRANSFER');
  const [status, setStatus] = useState<MovementStatus>(initial?.status ?? 'PENDING');
  const [movementDate, setMovementDate] = useState(formatDateForInput(initial?.movement_date));
  
  const [fromLocation, setFromLocation] = useState(initial?.from_location ?? '');
  const [fromZone, setFromZone] = useState<WarehouseZone | ''>(initial?.from_zone ?? '');
  const [toLocation, setToLocation] = useState(initial?.to_location ?? '');
  const [toZone, setToZone] = useState<WarehouseZone | ''>(initial?.to_zone ?? '');
  
  const [quantity, setQuantity] = useState<number | ''>(initial?.quantity ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'pcs');
  
  // Handle reference_number - could be from reference_id or reference_number field
  const getReferenceNumber = () => {
    if (initial?.reference_number) return initial.reference_number;
    // If reference_id exists but no reference_number, use reference_id as fallback
    if ((initial as any)?.reference_id) return String((initial as any).reference_id);
    return '';
  };
  const [referenceNumber, setReferenceNumber] = useState(getReferenceNumber());
  const [referenceType, setReferenceType] = useState(initial?.reference_type ?? 'OTHER');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Fetch products on mount and initialize form when initial changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await listProducts();
        setProducts(productsList);
        
        // If editing, find the selected product and initialize all fields
        if (initial?.item_id) {
          const productId = typeof initial.item_id === 'string' ? parseInt(initial.item_id) : initial.item_id;
          if (!isNaN(productId)) {
            const product = productsList.find(p => p.id === productId);
            if (product) {
              setSelectedProduct(product);
              setSelectedProductId(productId);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, [initial?.item_id]);

  // Update form fields when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial) {
      // Update all fields from initial data
      const productId = typeof initial.item_id === 'string' ? parseInt(initial.item_id) : (initial.item_id as number | undefined);
      if (productId !== undefined && !isNaN(productId)) {
        setSelectedProductId(productId);
      }
      setMovementType(initial.movement_type ?? 'TRANSFER');
      setStatus(initial.status ?? 'PENDING');
      setMovementDate(formatDateForInput(initial.movement_date));
      setFromLocation(initial.from_location ?? '');
      setFromZone(initial.from_zone ?? '');
      setToLocation(initial.to_location ?? '');
      setToZone(initial.to_zone ?? '');
      setQuantity(initial.quantity !== undefined ? initial.quantity : '');
      setUnit(initial.unit ?? 'pcs');
      setReferenceNumber(getReferenceNumber());
      setReferenceType(initial.reference_type ?? 'OTHER');
      setNotes(initial.notes ?? '');
    }
  }, [initial]);

  // Fetch stock when product is selected and movement is OUT
  useEffect(() => {
    const fetchStock = async () => {
      if (!selectedProductId || !isOutMovement(movementType)) {
        setAvailableStock(0);
        return;
      }

      setLoadingStock(true);
      try {
        // Extract warehouse_id from from_location (e.g., "WH-1" -> 1)
        const warehouseMatch = fromLocation.match(/WH-(\d+)/);
        const warehouseId = warehouseMatch ? parseInt(warehouseMatch[1]) : 1;

        const response = await apiRequest<{
          success: boolean;
          data: {
            quantity_available: number;
            quantity_on_hand: number;
          };
        }>(`/inventory/stock/${selectedProductId}?warehouse_id=${warehouseId}`);
        
        if (response.success && response.data) {
          setAvailableStock(response.data.quantity_available || 0);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
        setAvailableStock(0);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [selectedProductId, movementType, fromLocation]);

  // Update selected product when dropdown changes
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value ? parseInt(e.target.value) : '';
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setQuantity(''); // Reset quantity when product changes
  };

  // Validate quantity for OUT movements
  const validateQuantity = (qty: number | ''): boolean => {
    if (qty === '') return true; // Empty is okay during typing
    if (isOutMovement(movementType) && availableStock > 0) {
      return Number(qty) <= availableStock;
    }
    return Number(qty) > 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || quantity === '' || !fromLocation || !toLocation || !movementDate) {
      return;
    }

    // Validate quantity for OUT movements
    if (isOutMovement(movementType) && availableStock > 0 && Number(quantity) > availableStock) {
      alert(`Quantity cannot exceed available stock (${availableStock})`);
      return;
    }

    // Extract warehouse IDs from locations (e.g., "WH-1" -> 1)
    const fromMatch = fromLocation.match(/WH-(\d+)/);
    const toMatch = toLocation.match(/WH-(\d+)/);
    const fromWarehouseId = fromMatch ? parseInt(fromMatch[1]) : 1;
    const toWarehouseId = toMatch ? parseInt(toMatch[1]) : 1;

    onSubmit({
      item_id: selectedProductId.toString(),
      item_name: selectedProduct?.name || '',
      item_sku: selectedProduct?.product_code || '',
      movement_type: movementType,
      status,
      movement_date: movementDate,
      from_location: fromLocation,
      from_zone: fromZone || undefined,
      to_location: toLocation,
      to_zone: toZone || undefined,
      quantity: Number(quantity),
      unit: unit || undefined,
      reference_number: referenceNumber || undefined,
      reference_type: referenceType as any,
      notes: notes || undefined,
      // Include product_id and warehouse IDs for backend mapping
      product_id: selectedProductId,
      from: fromWarehouseId,
      to: toWarehouseId,
    } as any);
  };

  const showAvailableStock = isOutMovement(movementType) && selectedProductId && availableStock > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Movement Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Movement Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Movement Date"
            type="date"
            value={movementDate}
            onChange={(e) => setMovementDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
          <Select
            label="Movement Type"
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value as MovementType);
              setQuantity(''); // Reset quantity when type changes
            }}
            required
          >
            <option value="TRANSFER">Transfer</option>
            <option value="RECEIPT">Receipt</option>
            <option value="SHIPMENT">Shipment</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as MovementStatus)}
            required
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Item Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Item Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Item Name"
            value={selectedProductId}
            onChange={handleProductChange}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.product_code})
              </option>
            ))}
          </Select>
          {selectedProduct && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>SKU: {selectedProduct.product_code}</span>
              {selectedProduct.unit_of_measure && (
                <span>• Unit: {selectedProduct.unit_of_measure}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Locations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="From Location"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            required
          >
            <option value="">Select location</option>
            {mockLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </Select>
          <Select
            label="From Zone"
            value={fromZone}
            onChange={(e) => setFromZone(e.target.value as WarehouseZone)}
          >
            <option value="">Select zone</option>
            {mockZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <Select
            label="To Location"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            required
          >
            <option value="">Select location</option>
            {mockLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </Select>
          <Select
            label="To Zone"
            value={toZone}
            onChange={(e) => setToZone(e.target.value as WarehouseZone)}
          >
            <option value="">Select zone</option>
            {mockZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Quantities */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quantities</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : Number(e.target.value);
              setQuantity(val);
            }}
            placeholder="0"
            min={0}
            max={showAvailableStock ? availableStock : undefined}
            required
            className={showAvailableStock && quantity !== '' && Number(quantity) > availableStock ? 'border-red-500' : ''}
          />
          {showAvailableStock && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Available Stock:</span>
              <span className={`font-semibold ${loadingStock ? 'text-slate-400' : 'text-slate-900'}`}>
                {loadingStock ? 'Loading...' : availableStock}
              </span>
              {quantity !== '' && Number(quantity) > availableStock && (
                <span className="text-red-500">(Exceeds available stock)</span>
              )}
            </div>
          )}
          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="pcs, kg, etc."
          />
        </div>
      </div>

      {/* References */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">References</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="PO, SO, or other reference"
          />
          <Select
            label="Reference Type"
            value={referenceType}
            onChange={(e) => setReferenceType(e.target.value as 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER_ORDER' | 'ADJUSTMENT' | 'OTHER')}
          >
            <option value="PURCHASE_ORDER">Purchase Order</option>
            <option value="SALES_ORDER">Sales Order</option>
            <option value="TRANSFER_ORDER">Transfer Order</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes"
          rows={3}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Movement' : 'Create Movement'}
        </Button>
      </div>
    </form>
  );
}
