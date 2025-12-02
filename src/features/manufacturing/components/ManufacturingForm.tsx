import { FormEvent, useState, useEffect } from 'react';
import type { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority, ProductionType, QualityStatus, Currency } from '../types';
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

export function ManufacturingForm({ initial, onSubmit, onCancel }: Props) {
  // Production Order Identification
  const [productionOrderNumber, setProductionOrderNumber] = useState(initial?.production_order_number ?? generateProductionOrderNumber());
  const [workOrderNumber, setWorkOrderNumber] = useState(initial?.work_order_number ?? '');
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [salesOrderNumber, setSalesOrderNumber] = useState(initial?.sales_order_number ?? '');
  
  // Product Information
  const [product, setProduct] = useState(initial?.product ?? '');
  const [productCode, setProductCode] = useState(initial?.product_code ?? '');
  const [productId, setProductId] = useState(initial?.product_id ?? '');
  const [productDescription, setProductDescription] = useState(initial?.product_description ?? '');
  const [bomNumber, setBomNumber] = useState(initial?.bom_number ?? '');
  const [bomVersion, setBomVersion] = useState(initial?.bom_version ?? '');
  
  // Quantity & Units
  const [plannedQty, setPlannedQty] = useState(initial?.planned_qty?.toString() ?? '');
  const [producedQty, setProducedQty] = useState(initial?.produced_qty?.toString() ?? '');
  const [goodQty, setGoodQty] = useState(initial?.good_qty?.toString() ?? '');
  const [scrapQty, setScrapQty] = useState(initial?.scrap_qty?.toString() ?? '');
  const [reworkQty, setReworkQty] = useState(initial?.rework_qty?.toString() ?? '');
  const [pendingQty, setPendingQty] = useState(initial?.pending_qty?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'Units');
  
  // Dates
  const [startDate, setStartDate] = useState(initial?.start_date ?? new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [plannedStartDate, setPlannedStartDate] = useState(initial?.planned_start_date ?? '');
  const [plannedEndDate, setPlannedEndDate] = useState(initial?.planned_end_date ?? '');
  const [actualStartDate, setActualStartDate] = useState(initial?.actual_start_date ?? '');
  const [actualEndDate, setActualEndDate] = useState(initial?.actual_end_date ?? '');
  
  // Status & Priority
  const [status, setStatus] = useState<ProductionOrderStatus>(initial?.status ?? 'DRAFT');
  const [priority, setPriority] = useState<ProductionOrderPriority>(initial?.priority ?? 'MEDIUM');
  const [productionType, setProductionType] = useState<ProductionType>(initial?.production_type ?? 'MAKE_TO_STOCK');
  
  // Cost & Financial
  const [estimatedCost, setEstimatedCost] = useState(initial?.estimated_cost?.toString() ?? '');
  const [actualCost, setActualCost] = useState(initial?.actual_cost?.toString() ?? '');
  const [materialCost, setMaterialCost] = useState(initial?.material_cost?.toString() ?? '');
  const [laborCost, setLaborCost] = useState(initial?.labor_cost?.toString() ?? '');
  const [overheadCost, setOverheadCost] = useState(initial?.overhead_cost?.toString() ?? '');
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'USD');
  
  // Production Details
  const [batchNumber, setBatchNumber] = useState(initial?.batch_number ?? '');
  const [lotNumber, setLotNumber] = useState(initial?.lot_number ?? '');
  const [shift, setShift] = useState(initial?.shift ?? '');
  const [productionLine, setProductionLine] = useState(initial?.production_line ?? '');
  const [workCenter, setWorkCenter] = useState(initial?.work_center ?? '');
  const [machineId, setMachineId] = useState(initial?.machine_id ?? '');
  
  // Progress & Efficiency
  const [progressPercentage, setProgressPercentage] = useState(initial?.progress_percentage?.toString() ?? '');
  const [completionPercentage, setCompletionPercentage] = useState(initial?.completion_percentage?.toString() ?? '');
  const [efficiencyPercentage, setEfficiencyPercentage] = useState(initial?.efficiency_percentage?.toString() ?? '');
  const [yieldPercentage, setYieldPercentage] = useState(initial?.yield_percentage?.toString() ?? '');
  
  // Time Tracking
  const [estimatedHours, setEstimatedHours] = useState(initial?.estimated_hours?.toString() ?? '');
  const [actualHours, setActualHours] = useState(initial?.actual_hours?.toString() ?? '');
  const [setupTimeHours, setSetupTimeHours] = useState(initial?.setup_time_hours?.toString() ?? '');
  const [runTimeHours, setRunTimeHours] = useState(initial?.run_time_hours?.toString() ?? '');
  const [downtimeHours, setDowntimeHours] = useState(initial?.downtime_hours?.toString() ?? '');
  
  // Assignment
  const [supervisor, setSupervisor] = useState(initial?.supervisor ?? '');
  const [supervisorId, setSupervisorId] = useState(initial?.supervisor_id ?? '');
  const [assignedTeam, setAssignedTeam] = useState(initial?.assigned_team?.join(', ') ?? '');
  const [operators, setOperators] = useState(initial?.operators?.join(', ') ?? '');
  
  // Quality Control
  const [qualityCheckRequired, setQualityCheckRequired] = useState(initial?.quality_check_required ?? false);
  const [qualityStatus, setQualityStatus] = useState<QualityStatus>(initial?.quality_status ?? 'PENDING');
  const [inspectedBy, setInspectedBy] = useState(initial?.inspected_by ?? '');
  const [inspectionDate, setInspectionDate] = useState(initial?.inspection_date ?? '');
  const [inspectionNotes, setInspectionNotes] = useState(initial?.inspection_notes ?? '');
  
  // Materials & Resources
  const [rawMaterialsAllocated, setRawMaterialsAllocated] = useState(initial?.raw_materials_allocated ?? false);
  const [rawMaterialsIssued, setRawMaterialsIssued] = useState(initial?.raw_materials_issued ?? false);
  const [toolsAllocated, setToolsAllocated] = useState(initial?.tools_allocated ?? false);
  
  // Customer & Project
  const [customerName, setCustomerName] = useState(initial?.customer_name ?? '');
  const [customerId, setCustomerId] = useState(initial?.customer_id ?? '');
  const [projectId, setProjectId] = useState(initial?.project_id ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  
  // Additional Details
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');
  const [specialInstructions, setSpecialInstructions] = useState(initial?.special_instructions ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');

  // Auto-calculate total cost
  useEffect(() => {
    const material = parseFloat(materialCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const overhead = parseFloat(overheadCost) || 0;
    const total = material + labor + overhead;
    setCost(total.toFixed(2));
    if (!actualCost) {
      setActualCost(total.toFixed(2));
    }
  }, [materialCost, laborCost, overheadCost]);

  // Auto-calculate pending quantity
  useEffect(() => {
    const planned = parseFloat(plannedQty) || 0;
    const produced = parseFloat(producedQty) || 0;
    const pending = planned - produced;
    setPendingQty(pending.toString());
  }, [plannedQty, producedQty]);

  // Auto-calculate yield percentage
  useEffect(() => {
    const produced = parseFloat(producedQty) || 0;
    const good = parseFloat(goodQty) || 0;
    if (produced > 0) {
      const yieldPct = (good / produced) * 100;
      setYieldPercentage(yieldPct.toFixed(2));
    }
  }, [producedQty, goodQty]);

  // Auto-calculate progress percentage
  useEffect(() => {
    const planned = parseFloat(plannedQty) || 0;
    const produced = parseFloat(producedQty) || 0;
    if (planned > 0) {
      const progress = (produced / planned) * 100;
      setProgressPercentage(progress.toFixed(2));
      setCompletionPercentage(progress.toFixed(2));
    }
  }, [plannedQty, producedQty]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const payload: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'> = {
      production_order_number: productionOrderNumber,
      work_order_number: workOrderNumber || undefined,
      reference_number: referenceNumber || undefined,
      sales_order_number: salesOrderNumber || undefined,
      product,
      product_code: productCode || undefined,
      product_id: productId || undefined,
      product_description: productDescription || undefined,
      bom_number: bomNumber || undefined,
      bom_version: bomVersion || undefined,
      planned_qty: parseFloat(plannedQty),
      produced_qty: producedQty ? parseFloat(producedQty) : undefined,
      good_qty: goodQty ? parseFloat(goodQty) : undefined,
      scrap_qty: scrapQty ? parseFloat(scrapQty) : undefined,
      rework_qty: reworkQty ? parseFloat(reworkQty) : undefined,
      pending_qty: pendingQty ? parseFloat(pendingQty) : undefined,
      unit,
      start_date: startDate,
      end_date: endDate,
      planned_start_date: plannedStartDate || undefined,
      planned_end_date: plannedEndDate || undefined,
      actual_start_date: actualStartDate || undefined,
      actual_end_date: actualEndDate || undefined,
      status,
      priority,
      production_type: productionType,
      estimated_cost: parseFloat(estimatedCost),
      actual_cost: actualCost ? parseFloat(actualCost) : undefined,
      material_cost: materialCost ? parseFloat(materialCost) : undefined,
      labor_cost: laborCost ? parseFloat(laborCost) : undefined,
      overhead_cost: overheadCost ? parseFloat(overheadCost) : undefined,
      cost: parseFloat(cost),
      currency,
      batch_number: batchNumber || undefined,
      lot_number: lotNumber || undefined,
      shift: shift || undefined,
      production_line: productionLine || undefined,
      work_center: workCenter || undefined,
      machine_id: machineId || undefined,
      progress_percentage: progressPercentage ? parseFloat(progressPercentage) : undefined,
      completion_percentage: completionPercentage ? parseFloat(completionPercentage) : undefined,
      efficiency_percentage: efficiencyPercentage ? parseFloat(efficiencyPercentage) : undefined,
      yield_percentage: yieldPercentage ? parseFloat(yieldPercentage) : undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      actual_hours: actualHours ? parseFloat(actualHours) : undefined,
      setup_time_hours: setupTimeHours ? parseFloat(setupTimeHours) : undefined,
      run_time_hours: runTimeHours ? parseFloat(runTimeHours) : undefined,
      downtime_hours: downtimeHours ? parseFloat(downtimeHours) : undefined,
      supervisor: supervisor || undefined,
      supervisor_id: supervisorId || undefined,
      assigned_team: assignedTeam ? assignedTeam.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      operators: operators ? operators.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      quality_check_required: qualityCheckRequired,
      quality_status: qualityStatus || undefined,
      inspected_by: inspectedBy || undefined,
      inspection_date: inspectionDate || undefined,
      inspection_notes: inspectionNotes || undefined,
      raw_materials_allocated: rawMaterialsAllocated,
      raw_materials_issued: rawMaterialsIssued,
      tools_allocated: toolsAllocated,
      customer_name: customerName || undefined,
      customer_id: customerId || undefined,
      project_id: projectId || undefined,
      department: department || undefined,
      description: description || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
      special_instructions: specialInstructions || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Production Order Identification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Production Order Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Production Order # <span className="text-red-500">*</span>
            </label>
            <Input
              value={productionOrderNumber}
              onChange={(e) => setProductionOrderNumber(e.target.value)}
              placeholder="MO-2025-0001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Work Order #
            </label>
            <Input
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
              placeholder="WO-2025-0001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reference Number
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="REF-MFG-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Sales Order #
            </label>
            <Input
              value={salesOrderNumber}
              onChange={(e) => setSalesOrderNumber(e.target.value)}
              placeholder="SO-2025-001"
            />
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Product Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Industrial Pump - Model IP-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Product Code
            </label>
            <Input
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="IP-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Product ID
            </label>
            <Input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="prod-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              BOM Number
            </label>
            <Input
              value={bomNumber}
              onChange={(e) => setBomNumber(e.target.value)}
              placeholder="BOM-IP500-V1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              BOM Version
            </label>
            <Input
              value={bomVersion}
              onChange={(e) => setBomVersion(e.target.value)}
              placeholder="V1.2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Product Description
            </label>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Brief description of the product"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Quantity & Units */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Quantity & Units
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Planned Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={plannedQty}
              onChange={(e) => setPlannedQty(e.target.value)}
              placeholder="100"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Unit <span className="text-red-500">*</span>
            </label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Units"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Produced Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={producedQty}
              onChange={(e) => setProducedQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Good Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={goodQty}
              onChange={(e) => setGoodQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Scrap Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={scrapQty}
              onChange={(e) => setScrapQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Rework Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={reworkQty}
              onChange={(e) => setReworkQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Pending Quantity (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={pendingQty}
              readOnly
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              End Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Planned Start Date
            </label>
            <Input
              type="date"
              value={plannedStartDate}
              onChange={(e) => setPlannedStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Planned End Date
            </label>
            <Input
              type="date"
              value={plannedEndDate}
              onChange={(e) => setPlannedEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Start Date
            </label>
            <Input
              type="date"
              value={actualStartDate}
              onChange={(e) => setActualStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual End Date
            </label>
            <Input
              type="date"
              value={actualEndDate}
              onChange={(e) => setActualEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status & Priority */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Status & Priority
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as ProductionOrderStatus)} required>
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
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Priority <span className="text-red-500">*</span>
            </label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as ProductionOrderPriority)} required>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Production Type <span className="text-red-500">*</span>
            </label>
            <Select value={productionType} onChange={(e) => setProductionType(e.target.value as ProductionType)} required>
              <option value="MAKE_TO_STOCK">Make to Stock</option>
              <option value="MAKE_TO_ORDER">Make to Order</option>
              <option value="ASSEMBLY">Assembly</option>
              <option value="BATCH">Batch</option>
              <option value="CONTINUOUS">Continuous</option>
              <option value="JOB_SHOP">Job Shop</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Cost & Financial */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Cost & Financial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Estimated Cost <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} required>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Material Cost
            </label>
            <Input
              type="number"
              step="0.01"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Labor Cost
            </label>
            <Input
              type="number"
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Overhead Cost
            </label>
            <Input
              type="number"
              step="0.01"
              value={overheadCost}
              onChange={(e) => setOverheadCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Total Cost (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={cost}
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Cost
            </label>
            <Input
              type="number"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Production Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Production Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Batch Number
            </label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="BATCH-2025-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Lot Number
            </label>
            <Input
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder="LOT-IP500-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Shift
            </label>
            <Select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="">Select Shift</option>
              <option value="Day Shift">Day Shift</option>
              <option value="Night Shift">Night Shift</option>
              <option value="Morning Shift">Morning Shift</option>
              <option value="Evening Shift">Evening Shift</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Production Line
            </label>
            <Input
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
              placeholder="Line A"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Work Center
            </label>
            <Input
              value={workCenter}
              onChange={(e) => setWorkCenter(e.target.value)}
              placeholder="Assembly Center 1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Machine ID
            </label>
            <Input
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              placeholder="MACH-001"
            />
          </div>
        </div>
      </div>

      {/* Progress & Efficiency */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Progress & Efficiency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Progress % (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={progressPercentage}
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Completion %
            </label>
            <Input
              type="number"
              step="0.01"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Efficiency %
            </label>
            <Input
              type="number"
              step="0.01"
              value={efficiencyPercentage}
              onChange={(e) => setEfficiencyPercentage(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Yield % (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={yieldPercentage}
              readOnly
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Time Tracking */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Time Tracking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Estimated Hours
            </label>
            <Input
              type="number"
              step="0.01"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Hours
            </label>
            <Input
              type="number"
              step="0.01"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Setup Time (Hours)
            </label>
            <Input
              type="number"
              step="0.01"
              value={setupTimeHours}
              onChange={(e) => setSetupTimeHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Run Time (Hours)
            </label>
            <Input
              type="number"
              step="0.01"
              value={runTimeHours}
              onChange={(e) => setRunTimeHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Downtime (Hours)
            </label>
            <Input
              type="number"
              step="0.01"
              value={downtimeHours}
              onChange={(e) => setDowntimeHours(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Assignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Supervisor
            </label>
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Supervisor ID
            </label>
            <Input
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              placeholder="emp-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Assigned Teams (comma-separated)
            </label>
            <Input
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              placeholder="Production Team A, Assembly Team 1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Operators (comma-separated)
            </label>
            <Input
              value={operators}
              onChange={(e) => setOperators(e.target.value)}
              placeholder="Operator 1, Operator 2"
            />
          </div>
        </div>
      </div>

      {/* Quality Control */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Quality Control
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="qualityCheckRequired"
                checked={qualityCheckRequired}
                onChange={(e) => setQualityCheckRequired(e.target.checked)}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="qualityCheckRequired" className="text-xs font-medium text-slate-700">
                Quality Check Required
              </label>
            </div>
          </div>
          {qualityCheckRequired && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Quality Status
                </label>
                <Select value={qualityStatus} onChange={(e) => setQualityStatus(e.target.value as QualityStatus)}>
                  <option value="PENDING">Pending</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REWORK_REQUIRED">Rework Required</option>
                  <option value="NOT_REQUIRED">Not Required</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Inspected By
                </label>
                <Input
                  value={inspectedBy}
                  onChange={(e) => setInspectedBy(e.target.value)}
                  placeholder="QC Inspector"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Inspection Date
                </label>
                <Input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Inspection Notes
                </label>
                <Textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Quality inspection notes"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Materials & Resources */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Materials & Resources
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rawMaterialsAllocated"
              checked={rawMaterialsAllocated}
              onChange={(e) => setRawMaterialsAllocated(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="rawMaterialsAllocated" className="text-xs font-medium text-slate-700">
              Raw Materials Allocated
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rawMaterialsIssued"
              checked={rawMaterialsIssued}
              onChange={(e) => setRawMaterialsIssued(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="rawMaterialsIssued" className="text-xs font-medium text-slate-700">
              Raw Materials Issued
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="toolsAllocated"
              checked={toolsAllocated}
              onChange={(e) => setToolsAllocated(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="toolsAllocated" className="text-xs font-medium text-slate-700">
              Tools Allocated
            </label>
          </div>
        </div>
      </div>

      {/* Customer & Project */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Customer & Project
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer Name
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer ID
            </label>
            <Input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="CUST-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Project ID
            </label>
            <Input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="PROJ-2025-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Department
            </label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Production"
            />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the production order"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Internal Notes
            </label>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal notes (not visible externally)"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Special Instructions
            </label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Special manufacturing instructions"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tags (comma-separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pumps, industrial, high-priority"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Production Order' : 'Create Production Order'}
        </Button>
      </div>
    </form>
  );
}
