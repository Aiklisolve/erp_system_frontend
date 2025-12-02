import { FormEvent, useState } from 'react';
import type { StockMovement, MovementType, MovementStatus, WarehouseZone } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<StockMovement>;
  onSubmit: (values: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate movement number
function generateMovementNumber(): string {
  const prefix = 'MV';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// Mock locations for dropdowns
const mockLocations = [
  'WH-01-A', 'WH-01-B', 'WH-02-A', 'WH-02-B',
  'Main DC', 'Store-01', 'Store-02', 'Store-03',
  'Distribution Center', 'Regional Warehouse',
];

const mockZones: WarehouseZone[] = [
  'RECEIVING', 'STORAGE', 'PICKING', 'PACKING', 'SHIPPING', 'QUARANTINE'
];

export function WarehouseForm({ initial, onSubmit, onCancel }: Props) {
  const [movementNumber, setMovementNumber] = useState(initial?.movement_number ?? generateMovementNumber());
  const [itemId, setItemId] = useState(initial?.item_id ?? '');
  const [itemName, setItemName] = useState(initial?.item_name ?? '');
  const [itemSku, setItemSku] = useState(initial?.item_sku ?? '');
  
  const [movementType, setMovementType] = useState<MovementType>(initial?.movement_type ?? 'TRANSFER');
  const [status, setStatus] = useState<MovementStatus>(initial?.status ?? 'PENDING');
  const [movementDate, setMovementDate] = useState(
    initial?.movement_date ?? new Date().toISOString().slice(0, 10)
  );
  const [completedDate, setCompletedDate] = useState(initial?.completed_date ?? '');
  
  const [fromLocation, setFromLocation] = useState(initial?.from_location ?? '');
  const [fromZone, setFromZone] = useState<WarehouseZone | ''>(initial?.from_zone ?? '');
  const [fromBin, setFromBin] = useState(initial?.from_bin ?? '');
  const [toLocation, setToLocation] = useState(initial?.to_location ?? '');
  const [toZone, setToZone] = useState<WarehouseZone | ''>(initial?.to_zone ?? '');
  const [toBin, setToBin] = useState(initial?.to_bin ?? '');
  
  const [quantity, setQuantity] = useState<number | ''>(initial?.quantity ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'pcs');
  const [availableQuantity, setAvailableQuantity] = useState<number | ''>(initial?.available_quantity ?? '');
  const [receivedQuantity, setReceivedQuantity] = useState<number | ''>(initial?.received_quantity ?? '');
  
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [referenceType, setReferenceType] = useState(initial?.reference_type ?? 'OTHER');
  const [batchNumber, setBatchNumber] = useState(initial?.batch_number ?? '');
  const [lotNumber, setLotNumber] = useState(initial?.lot_number ?? '');
  
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '');
  const [operatorName, setOperatorName] = useState(initial?.operator_name ?? '');
  const [supervisor, setSupervisor] = useState(initial?.supervisor ?? '');
  
  const [qualityCheckRequired, setQualityCheckRequired] = useState(initial?.quality_check_required ?? false);
  const [qualityCheckPassed, setQualityCheckPassed] = useState(initial?.quality_check_passed ?? false);
  const [inspectedBy, setInspectedBy] = useState(initial?.inspected_by ?? '');
  const [inspectionDate, setInspectionDate] = useState(initial?.inspection_date ?? '');
  
  const [carrier, setCarrier] = useState(initial?.carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(initial?.tracking_number ?? '');
  const [expectedArrivalDate, setExpectedArrivalDate] = useState(initial?.expected_arrival_date ?? '');
  const [actualArrivalDate, setActualArrivalDate] = useState(initial?.actual_arrival_date ?? '');
  
  const [unitCost, setUnitCost] = useState<number | ''>(initial?.unit_cost ?? '');
  const [totalCost, setTotalCost] = useState<number | ''>(initial?.total_cost ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [reason, setReason] = useState(initial?.reason ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Calculate total cost
  const handleQuantityOrCostChange = () => {
    const qty = Number(quantity) || 0;
    const cost = Number(unitCost) || 0;
    if (qty > 0 && cost > 0) {
      setTotalCost(qty * cost);
    } else {
      setTotalCost('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!itemId || quantity === '' || !fromLocation || !toLocation || !movementDate) return;
    
    onSubmit({
      movement_number: movementNumber,
      item_id: itemId,
      item_name: itemName || undefined,
      item_sku: itemSku || undefined,
      movement_type: movementType,
      status,
      movement_date: movementDate,
      completed_date: completedDate || undefined,
      from_location: fromLocation,
      from_zone: fromZone || undefined,
      from_bin: fromBin || undefined,
      to_location: toLocation,
      to_zone: toZone || undefined,
      to_bin: toBin || undefined,
      quantity: Number(quantity),
      unit: unit || undefined,
      available_quantity: Number(availableQuantity) || undefined,
      received_quantity: Number(receivedQuantity) || undefined,
      reference_number: referenceNumber || undefined,
      reference_type: referenceType as any,
      batch_number: batchNumber || undefined,
      lot_number: lotNumber || undefined,
      assigned_to: assignedTo || undefined,
      operator_name: operatorName || undefined,
      supervisor: supervisor || undefined,
      quality_check_required: qualityCheckRequired,
      quality_check_passed: qualityCheckPassed || undefined,
      inspected_by: inspectedBy || undefined,
      inspection_date: inspectionDate || undefined,
      carrier: carrier || undefined,
      tracking_number: trackingNumber || undefined,
      expected_arrival_date: expectedArrivalDate || undefined,
      actual_arrival_date: actualArrivalDate || undefined,
      unit_cost: Number(unitCost) || undefined,
      total_cost: Number(totalCost) || undefined,
      currency: currency || undefined,
      reason: reason || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Movement Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Movement Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Movement Number"
            value={movementNumber}
            onChange={(e) => setMovementNumber(e.target.value)}
            placeholder="Auto-generated"
          />
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
            onChange={(e) => setMovementType(e.target.value as MovementType)}
            required
          >
            <option value="TRANSFER">Transfer</option>
            <option value="RECEIPT">Receipt</option>
            <option value="SHIPMENT">Shipment</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURN">Return</option>
            <option value="CYCLE_COUNT">Cycle Count</option>
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
        {status === 'COMPLETED' && (
          <Input
            label="Completed Date"
            type="date"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        )}
      </div>

      {/* Item Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Item Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Item ID / SKU"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="Item ID or SKU"
            required
          />
          <Input
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name"
          />
          <Input
            label="SKU"
            value={itemSku}
            onChange={(e) => setItemSku(e.target.value)}
            placeholder="SKU code"
          />
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">From Location</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Input
            label="From Bin"
            value={fromBin}
            onChange={(e) => setFromBin(e.target.value)}
            placeholder="Bin number"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">To Location</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Input
            label="To Bin"
            value={toBin}
            onChange={(e) => setToBin(e.target.value)}
            placeholder="Bin number"
          />
        </div>
      </div>

      {/* Quantities */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quantities</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value === '' ? '' : Number(e.target.value));
              handleQuantityOrCostChange();
            }}
            placeholder="0"
            min={0}
            required
          />
          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="pcs, kg, etc."
          />
          <Input
            label="Available Quantity"
            type="number"
            value={availableQuantity}
            onChange={(e) => setAvailableQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Available at source"
            min={0}
          />
          <Input
            label="Received Quantity"
            type="number"
            value={receivedQuantity}
            onChange={(e) => setReceivedQuantity(e.target.value === '' ? Number(quantity) : Number(e.target.value))}
            placeholder="Actually received"
            min={0}
            max={Number(quantity) || undefined}
          />
        </div>
      </div>

      {/* References */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">References</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="PO, SO, or other reference"
          />
          <Select
            label="Reference Type"
            value={referenceType}
            onChange={(e) => setReferenceType(e.target.value)}
          >
            <option value="PURCHASE_ORDER">Purchase Order</option>
            <option value="SALES_ORDER">Sales Order</option>
            <option value="TRANSFER_ORDER">Transfer Order</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="OTHER">Other</option>
          </Select>
          <Input
            label="Batch Number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="Batch #"
          />
          <Input
            label="Lot Number"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="Lot #"
          />
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Assignment</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Assigned user"
          />
          <Input
            label="Operator Name"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            placeholder="Operator performing movement"
          />
          <Input
            label="Supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            placeholder="Supervisor name"
          />
        </div>
      </div>

      {/* Quality Check */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quality & Inspection</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="qualityCheckRequired"
              checked={qualityCheckRequired}
              onChange={(e) => setQualityCheckRequired(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="qualityCheckRequired" className="text-[11px] font-semibold text-slate-800">
              Quality Check Required
            </label>
          </div>
          {qualityCheckRequired && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="qualityCheckPassed"
                  checked={qualityCheckPassed}
                  onChange={(e) => setQualityCheckPassed(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="qualityCheckPassed" className="text-[11px] font-semibold text-slate-800">
                  Quality Check Passed
                </label>
              </div>
              <Input
                label="Inspected By"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                placeholder="Inspector name"
              />
              <Input
                label="Inspection Date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </>
          )}
        </div>
      </div>

      {/* Shipping & Receiving */}
      {(movementType === 'SHIPMENT' || movementType === 'RECEIPT') && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Shipping & Receiving</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Shipping carrier"
            />
            <Input
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking #"
            />
            <Input
              label="Expected Arrival Date"
              type="date"
              value={expectedArrivalDate}
              onChange={(e) => setExpectedArrivalDate(e.target.value)}
              min={movementDate}
            />
            <Input
              label="Actual Arrival Date"
              type="date"
              value={actualArrivalDate}
              onChange={(e) => setActualArrivalDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>
      )}

      {/* Cost & Valuation */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Cost & Valuation</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Unit Cost"
            type="number"
            value={unitCost}
            onChange={(e) => {
              setUnitCost(e.target.value === '' ? '' : Number(e.target.value));
              handleQuantityOrCostChange();
            }}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Total Cost"
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Auto-calculated"
            min={0}
            step="0.01"
            readOnly
            className="bg-slate-50"
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for movement/adjustment"
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Public notes"
          rows={2}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (not visible externally)"
          rows={2}
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
