import { FormEvent, useState, useEffect } from 'react';
import type { Product, ProductStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { listVendors } from '../../inventory/api/inventoryApi';
import { listWarehouses } from '../../warehouse/api/warehouseApi';
import { listUnitOfMeasures } from '../api/ecommerceApi';
import type { Vendor } from '../../inventory/types';
import type { Warehouse } from '../../warehouse/types';

type Props = {
  initial?: Partial<Product>;
  onSubmit: (values: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function ProductForm({ initial, onSubmit, onCancel }: Props) {
  // Basic Information
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  
  // Unit of Measure
  const [unitOfMeasure, setUnitOfMeasure] = useState((initial as any)?.unit_of_measure ?? '');
  const [newUnitOfMeasure, setNewUnitOfMeasure] = useState('');
  const [showNewUnitInput, setShowNewUnitInput] = useState(false);
  
  // Pricing
  const [costPrice, setCostPrice] = useState<number | ''>(initial?.cost_price ?? '');
  const [sellingPrice, setSellingPrice] = useState<number | ''>((initial?.selling_price || initial?.price) ?? '');
  const [taxRate, setTaxRate] = useState<number | ''>((initial as any)?.tax_rate ?? '');
  
  // Inventory Management
  const [reorderLevel, setReorderLevel] = useState<number | ''>((initial as any)?.reorder_level ?? '');
  const [reorderQuantity, setReorderQuantity] = useState<number | ''>((initial as any)?.reorder_quantity ?? '');
  const [quantityOnHand, setQuantityOnHand] = useState<number | ''>((initial?.stock || initial?.stock_quantity) ?? '');
  
  // Supplier & Warehouse
  const [supplierId, setSupplierId] = useState<number | ''>((initial as any)?.supplier_id ?? '');
  const [warehouseId, setWarehouseId] = useState<number | ''>((initial as any)?.warehouse_id ?? '');
  
  // Status
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'ACTIVE');
  
  // Dropdown data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [unitOfMeasures, setUnitOfMeasures] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch vendors, warehouses, and unit_of_measure values
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [vendorsData, warehousesData, unitsData] = await Promise.all([
          listVendors().catch(() => []),
          listWarehouses().catch(() => []),
          listUnitOfMeasures().catch(() => [])
        ]);
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
        setUnitOfMeasures(Array.isArray(unitsData) ? unitsData : []);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setVendors([]);
        setWarehouses([]);
        setUnitOfMeasures([]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Auto-fill form when initial changes (for edit mode)
  useEffect(() => {
    if (initial) {
      if (initial.name) setName(initial.name);
      if (initial.description) setDescription(initial.description);
      if (initial.category) setCategory(initial.category);
      if (initial.subcategory) setSubcategory(initial.subcategory);
      if ((initial as any).unit_of_measure) setUnitOfMeasure((initial as any).unit_of_measure);
      if (initial.cost_price !== undefined) setCostPrice(initial.cost_price);
      if (initial.selling_price !== undefined) setSellingPrice(initial.selling_price);
      if (initial.price !== undefined && !initial.selling_price) setSellingPrice(initial.price);
      if ((initial as any).tax_rate !== undefined) setTaxRate((initial as any).tax_rate);
      if ((initial as any).reorder_level !== undefined) setReorderLevel((initial as any).reorder_level);
      if ((initial as any).reorder_quantity !== undefined) setReorderQuantity((initial as any).reorder_quantity);
      if (initial.stock !== undefined) setQuantityOnHand(initial.stock);
      if (initial.stock_quantity !== undefined && !initial.stock) setQuantityOnHand(initial.stock_quantity);
      if ((initial as any).supplier_id !== undefined) setSupplierId((initial as any).supplier_id);
      if ((initial as any).warehouse_id !== undefined) setWarehouseId((initial as any).warehouse_id);
      if (initial.status) setStatus(initial.status);
    }
  }, [initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !unitOfMeasure) return;
    
    const finalUnitOfMeasure = showNewUnitInput && newUnitOfMeasure ? newUnitOfMeasure : unitOfMeasure;
    
    onSubmit({
      name,
      description: description || undefined,
      category: category || undefined,
      subcategory: subcategory || undefined,
      unit_of_measure: finalUnitOfMeasure,
      cost_price: costPrice === '' ? undefined : Number(costPrice),
      selling_price: sellingPrice === '' ? undefined : Number(sellingPrice),
      price: sellingPrice === '' ? (costPrice === '' ? 0 : Number(costPrice)) : Number(sellingPrice),
      tax_rate: taxRate === '' ? undefined : Number(taxRate),
      reorder_level: reorderLevel === '' ? undefined : Number(reorderLevel),
      reorder_quantity: reorderQuantity === '' ? undefined : Number(reorderQuantity),
      supplier_id: supplierId === '' ? undefined : Number(supplierId),
      warehouse_id: warehouseId === '' ? undefined : Number(warehouseId),
      stock: quantityOnHand === '' ? 0 : Number(quantityOnHand),
      stock_quantity: quantityOnHand === '' ? 0 : Number(quantityOnHand),
      status,
      product_type: 'SIMPLE',
      stock_status: quantityOnHand && Number(quantityOnHand) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      currency: 'INR',
      tax_status: 'TAXABLE'
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Basic Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
          />
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
          <Input
            label="Subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Subcategory"
          />
          <div>
            <Select
              label="Unit of Measurement"
              value={showNewUnitInput ? 'NEW' : unitOfMeasure}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  setShowNewUnitInput(true);
                } else {
                  setShowNewUnitInput(false);
                  setUnitOfMeasure(e.target.value);
                }
              }}
              required
              disabled={loadingData}
            >
              <option value="">Select unit</option>
              {unitOfMeasures.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
              <option value="NEW">+ Add New Unit</option>
            </Select>
            {showNewUnitInput && (
              <Input
                label="New Unit of Measurement"
                value={newUnitOfMeasure}
                onChange={(e) => setNewUnitOfMeasure(e.target.value)}
                placeholder="Enter new unit"
                className="mt-2"
                required={showNewUnitInput}
              />
            )}
          </div>
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description"
          rows={4}
        />
      </div>

      {/* Pricing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Cost Price"
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Selling Price"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* Inventory Management */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Inventory Management</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Reorder Level"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Reorder Quantity"
            type="number"
            value={reorderQuantity}
            onChange={(e) => setReorderQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Quantity on Hand"
            type="number"
            value={quantityOnHand}
            onChange={(e) => setQuantityOnHand(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
            required
          />
          <Select
            label="Warehouse"
            value={warehouseId === '' ? '' : String(warehouseId)}
            onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loadingData}
            required
          >
            <option value="">Select warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={String(warehouse.id)}>
                {warehouse.warehouse_name || warehouse.name || `Warehouse ${warehouse.id}`}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Supplier & Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Supplier & Status</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Supplier"
            value={supplierId === '' ? '' : String(supplierId)}
            onChange={(e) => setSupplierId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loadingData}
          >
            <option value="">Select supplier</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={String(vendor.id)}>
                {vendor.vendor_name || vendor.name || `Vendor ${vendor.id}`}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="DISCONTINUED">Discontinued</option>
          </Select>
        </div>
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
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto" disabled={loadingData}>
          {initial ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
