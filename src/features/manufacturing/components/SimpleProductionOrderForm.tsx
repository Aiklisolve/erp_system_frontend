import { FormEvent, useState } from 'react';
import type { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority, ProductionType, Currency } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

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
  // Essential fields only (matching backend API requirements)
  const [productionOrderNumber, setProductionOrderNumber] = useState(
    initial?.production_order_number ?? generateProductionOrderNumber()
  );
  const [workOrderNumber, setWorkOrderNumber] = useState(initial?.work_order_number ?? '');
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [productName, setProductName] = useState(initial?.product ?? '');
  const [productCode, setProductCode] = useState(initial?.product_code ?? '');
  const [productId, setProductId] = useState(initial?.product_id ?? '');
  const [plannedQty, setPlannedQty] = useState(initial?.planned_qty?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'Units');
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [status, setStatus] = useState<ProductionOrderStatus>(initial?.status ?? 'DRAFT');
  const [priority, setPriority] = useState<ProductionOrderPriority>(initial?.priority ?? 'MEDIUM');
  const [productionType, setProductionType] = useState<ProductionType>(
    initial?.production_type ?? 'MAKE_TO_STOCK'
  );
  const [estimatedCost, setEstimatedCost] = useState(initial?.estimated_cost?.toString() ?? '');
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '0');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'INR');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const values: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'> = {
      production_order_number: productionOrderNumber,
      work_order_number: workOrderNumber || undefined,
      reference_number: referenceNumber || undefined,
      product: productName,
      product_code: productCode || undefined,
      product_id: productId || undefined,
      planned_qty: parseInt(plannedQty) || 0,
      produced_qty: 0,
      pending_qty: parseInt(plannedQty) || 0,
      unit,
      start_date: startDate,
      end_date: endDate,
      status,
      priority,
      production_type: productionType,
      estimated_cost: parseFloat(estimatedCost) || 0,
      cost: parseFloat(cost) || 0,
      currency,
      notes: notes || undefined,
    };

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-sm text-slate-600 mb-4 p-3 bg-blue-50 rounded border border-blue-200">
        📝 <strong>Simplified Form:</strong> Only essential fields required by backend API
      </div>

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Production Order Number"
            value={productionOrderNumber}
            onChange={(e) => setProductionOrderNumber(e.target.value)}
            required
            placeholder="MO-2025-0001"
          />
          
          <Input
            label="Work Order Number"
            value={workOrderNumber}
            onChange={(e) => setWorkOrderNumber(e.target.value)}
            placeholder="WO-2025-0001"
          />
        </div>

        <Input
          label="Reference Number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="REF-001"
        />
      </div>

      {/* Section 2: Product Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Product Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            placeholder="Industrial Pump"
          />
          
          <Input
            label="Product Code"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="IP-500"
          />
        </div>

        <Input
          label="Product ID (Optional)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Leave empty if not required"
          helperText="Backend will auto-assign if not provided"
        />
      </div>

      {/* Section 3: Quantity & Dates */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Quantity & Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Planned Quantity"
            type="number"
            value={plannedQty}
            onChange={(e) => setPlannedQty(e.target.value)}
            required
            min="1"
            placeholder="100"
          />
          
          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            placeholder="Units, Pcs, Kg, etc."
          />
          
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            required
          >
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CNY">CNY - Chinese Yuan</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          
          <Input
            label="Expected End Date"
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
          Status & Classification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <Select
            label="Production Type"
            value={productionType}
            onChange={(e) => setProductionType(e.target.value as ProductionType)}
            required
          >
            <option value="MAKE_TO_STOCK">Make to Stock</option>
            <option value="MAKE_TO_ORDER">Make to Order</option>
            <option value="ASSEMBLY">Assembly</option>
            <option value="BATCH">Batch</option>
            <option value="CONTINUOUS">Continuous</option>
            <option value="JOB_SHOP">Job Shop</option>
          </Select>
        </div>
      </div>

      {/* Section 5: Cost Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Cost Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Estimated Cost"
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          
          <Input
            label="Actual Cost (Optional)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
            helperText="Leave as 0 for new orders"
          />
        </div>
      </div>

      {/* Section 6: Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Additional Notes
        </h3>
        
        <Textarea
          label="Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or instructions..."
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

