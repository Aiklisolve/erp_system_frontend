import { FormEvent, useState, useEffect, useMemo } from 'react';
import type { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority, ProductionType, Currency } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { listProducts, listUsers, type Product, type User } from '../api/manufacturingApi';

type Props = {
  initial?: Partial<ProductionOrder>;
  onSubmit: (values: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate production order number
function generateProductionOrderNumber(): string {
  const prefix = 'MO';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function SimpleProductionOrderForm({ initial, onSubmit, onCancel }: Props) {
  // Only fields that backend API actually accepts (based on curl example)
  const [productionOrderNumber, setProductionOrderNumber] = useState(
    initial?.production_order_number ?? generateProductionOrderNumber()
  );
  const [productId, setProductId] = useState(initial?.product_id ?? '');
  const [plannedQty, setPlannedQty] = useState(initial?.planned_qty?.toString() ?? '');
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [status, setStatus] = useState<ProductionOrderStatus>(initial?.status ?? 'DRAFT');
  const [priority, setPriority] = useState<ProductionOrderPriority>(initial?.priority ?? 'MEDIUM');
  const [productionLine, setProductionLine] = useState(initial?.production_line ?? '');
  const [shift, setShift] = useState(initial?.shift ?? '');
  const [supervisorId, setSupervisorId] = useState(initial?.supervisor_id ?? '');
  const [qualityStatus, setQualityStatus] = useState(initial?.quality_status ?? 'PENDING');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  
  // Products and Users for dropdowns
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Load products and users on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingProducts(true);
      setLoadingUsers(true);
      
      try {
        const [productsData, usersData] = await Promise.all([
          listProducts(),
          listUsers(),
        ]);
        
        setProducts(productsData);
        setUsers(usersData);
        
        console.log('✅ Loaded products:', productsData.length);
        console.log('✅ Loaded users:', usersData.length);
      } catch (error) {
        console.error('❌ Error loading dropdown data:', error);
      } finally {
        setLoadingProducts(false);
        setLoadingUsers(false);
      }
    };
    
    loadData();
  }, []);
  
  // Convert products to SearchableSelect options format
  const productOptions = useMemo(() => {
    return products.map((product) => ({
      value: product.id.toString(),
      label: `${product.id} - ${product.product_name || product.name || 'Unknown Product'}`,
      id: product.id,
    }));
  }, [products]);
  
  // Convert users to Select options format
  const userOptions = useMemo(() => {
    return users.map((user) => ({
      value: user.id.toString(),
      label: `${user.id} - ${user.name || user.full_name || 'Unknown User'}`,
      id: user.id,
    }));
  }, [users]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Only send fields that backend API accepts (matching curl example exactly)
    const values: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'> = {
      production_order_number: productionOrderNumber,
      product_id: productId ? productId.toString() : undefined, // Will be converted to number in API
      planned_qty: parseInt(plannedQty) || 0,
      start_date: startDate,
      end_date: endDate,
      status,
      priority,
      production_line: productionLine || undefined,
      shift: shift || undefined,
      supervisor_id: supervisorId ? supervisorId.toString() : undefined, // Will be converted to number in API
      quality_status: qualityStatus as any,
      notes: notes || undefined,
      // Required by frontend type but not sent to backend
      product: '', // Not sent to backend
      unit: 'Units', // Not sent to backend
      production_type: 'MAKE_TO_STOCK', // Not sent to backend
      estimated_cost: 0, // Not sent to backend
      cost: 0, // Not sent to backend
      currency: 'INR', // Not sent to backend
    };
    
    console.log('📝 Form submitted values:', {
      production_order_number: productionOrderNumber,
      product_id: productId,
      planned_qty: plannedQty,
      start_date: startDate,
      end_date: endDate,
      status,
      priority,
      production_line: productionLine,
      shift: shift,
      supervisor_id: supervisorId,
      quality_status: qualityStatus,
      notes: notes
    });

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-sm text-slate-600 mb-4 p-3 bg-blue-50 rounded border border-blue-200">
        📝 <strong>Backend API Form:</strong> Only fields accepted by backend API
      </div>

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Basic Information
        </h3>
        
        <Input
          label="Production Order Number"
          value={productionOrderNumber}
          onChange={(e) => setProductionOrderNumber(e.target.value)}
          required
          placeholder="MO-2025-0001"
        />
      </div>

      {/* Section 2: Product Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Product Information
        </h3>
        
        {loadingProducts ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Loading products...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
              No products available. Please add products first.
            </div>
          </div>
        ) : (
          <SearchableSelect
            label="Product"
            value={productId}
            onChange={(value) => setProductId(value)}
            options={productOptions}
            placeholder="Search and select product..."
            required
            maxHeight="200px"
          />
        )}
      </div>

      {/* Section 3: Quantity & Dates */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Quantity & Timeline
        </h3>
        
        <Input
          label="Planned Quantity"
          type="number"
          value={plannedQty}
          onChange={(e) => setPlannedQty(e.target.value)}
          required
          min="1"
          placeholder="543"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Section 4: Status & Priority */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Status & Priority
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductionOrderStatus)}
            required
          >
            <option value="DRAFT">Draft</option>
            <option value="PLANNED">Planned</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RELEASED">Released</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CLOSED">Closed</option>
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProductionOrderPriority)}
            required
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>
      </div>

      {/* Section 5: Production Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Production Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Production Line"
            value={productionLine}
            onChange={(e) => setProductionLine(e.target.value)}
            placeholder="Line-1"
          />
          
          <Select
            label="Shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          >
            <option value="">Select Shift</option>
            <option value="DAY">Day</option>
            <option value="NIGHT">Night</option>
            <option value="MORNING">Morning</option>
            <option value="EVENING">Evening</option>
          </Select>
        </div>

        {loadingUsers ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Supervisor
            </label>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Loading users...
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-800">
              Supervisor
            </label>
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
              No users available.
            </div>
          </div>
        ) : (
          <SearchableSelect
            label="Supervisor"
            value={supervisorId}
            onChange={(value) => setSupervisorId(value)}
            options={userOptions}
            placeholder="Search and select supervisor..."
            maxHeight="200px"
          />
        )}
      </div>

      {/* Section 6: Quality Status */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Quality Control
        </h3>
        
        <Select
          label="Quality Status"
          value={qualityStatus}
          onChange={(e) => setQualityStatus(e.target.value as any)}
          required
        >
          <option value="PENDING">Pending</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="REWORK_REQUIRED">Rework Required</option>
          <option value="NOT_REQUIRED">Not Required</option>
        </Select>
      </div>

      {/* Section 7: Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Additional Notes
        </h3>
        
        <Textarea
          label="Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Production order for batch 8488"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" tone="neutral" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" tone="brand">
          {initial ? 'Update Production Order' : 'Create Production Order'}
        </Button>
      </div>
    </form>
  );
}

