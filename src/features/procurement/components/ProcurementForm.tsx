import { FormEvent, useState, useEffect, useMemo } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderPriority, PaymentTerms, Currency, DeliveryMethod } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { apiRequest } from '../../../config/api';

type Props = {
  initial?: Partial<PurchaseOrder>;
  onSubmit: (values: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate PO number
function generatePONumber(): string {
  const prefix = 'PO';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function ProcurementForm({ initial, onSubmit, onCancel }: Props) {
  // PO Identification
  const [poNumber, setPoNumber] = useState(initial?.po_number ?? generatePONumber());
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  const [requisitionNumber, setRequisitionNumber] = useState(initial?.requisition_number ?? '');
  
  // Supplier Information
  const [supplier, setSupplier] = useState(initial?.supplier ?? '');
  const [supplierId, setSupplierId] = useState(initial?.supplier_id ?? '');
  const [supplierContactPerson, setSupplierContactPerson] = useState(initial?.supplier_contact_person ?? '');
  const [supplierEmail, setSupplierEmail] = useState(initial?.supplier_email ?? '');
  const [supplierPhone, setSupplierPhone] = useState(initial?.supplier_phone ?? '');
  
  // Dates
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initial?.expected_delivery_date ?? '');
  const [actualDeliveryDate, setActualDeliveryDate] = useState(initial?.actual_delivery_date ?? '');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  
  // Status & Priority
  const [status, setStatus] = useState<PurchaseOrderStatus>(initial?.status ?? 'DRAFT');
  const [priority, setPriority] = useState<PurchaseOrderPriority>(initial?.priority ?? 'MEDIUM');
  
  // Financial Details
  const [subtotal, setSubtotal] = useState(initial?.subtotal?.toString() ?? '');
  const [taxAmount, setTaxAmount] = useState(initial?.tax_amount?.toString() ?? '');
  const [shippingCost, setShippingCost] = useState(initial?.shipping_cost?.toString() ?? '');
  const [discountAmount, setDiscountAmount] = useState(initial?.discount_amount?.toString() ?? '');
  const [totalAmount, setTotalAmount] = useState(initial?.total_amount?.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'INR');
  const [exchangeRate, setExchangeRate] = useState(initial?.exchange_rate?.toString() ?? '');
  
  // Payment Information
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(initial?.payment_terms ?? 'NET_30');
  const [paymentTermsDays, setPaymentTermsDays] = useState(initial?.payment_terms_days?.toString() ?? '30');
  const [advancePaymentRequired, setAdvancePaymentRequired] = useState(initial?.advance_payment_required ?? false);
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState(initial?.advance_payment_amount?.toString() ?? '');
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState(initial?.advance_payment_percentage?.toString() ?? '');
  
  // Delivery Information
  const [deliveryAddress, setDeliveryAddress] = useState(initial?.delivery_address ?? '');
  const [deliveryCity, setDeliveryCity] = useState(initial?.delivery_city ?? '');
  const [deliveryState, setDeliveryState] = useState(initial?.delivery_state ?? '');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState(initial?.delivery_postal_code ?? '');
  const [deliveryCountry, setDeliveryCountry] = useState(initial?.delivery_country ?? 'USA');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(initial?.delivery_method ?? 'STANDARD');
  const [trackingNumber, setTrackingNumber] = useState(initial?.tracking_number ?? '');
  
  // Items Information
  const [itemsCount, setItemsCount] = useState(initial?.items_count?.toString() ?? '');
  const [totalQuantity, setTotalQuantity] = useState(initial?.total_quantity?.toString() ?? '');
  
  // Approval & Workflow
  const [requestedBy, setRequestedBy] = useState(initial?.requested_by ?? '');
  const [requestedById, setRequestedById] = useState(initial?.requested_by_id ?? '');
  const [approvedBy, setApprovedBy] = useState(initial?.approved_by ?? '');
  const [approvedById, setApprovedById] = useState(initial?.approved_by_id ?? '');
  const [approvalDate, setApprovalDate] = useState(initial?.approval_date ?? '');
  
  // Department & Project
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [projectId, setProjectId] = useState(initial?.project_id ?? '');
  const [costCenter, setCostCenter] = useState(initial?.cost_center ?? '');
  
  // Additional Details
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');
  const [termsAndConditions, setTermsAndConditions] = useState(initial?.terms_and_conditions ?? '');
  
  // Receiving Information
  const [receivedQuantity, setReceivedQuantity] = useState(initial?.received_quantity?.toString() ?? '');
  const [pendingQuantity, setPendingQuantity] = useState(initial?.pending_quantity?.toString() ?? '');
  const [qualityCheckRequired, setQualityCheckRequired] = useState(initial?.quality_check_required ?? false);
  const [qualityCheckPassed, setQualityCheckPassed] = useState(initial?.quality_check_passed ?? false);
  const [inspectedBy, setInspectedBy] = useState(initial?.inspected_by ?? '');
  const [inspectionDate, setInspectionDate] = useState(initial?.inspection_date ?? '');
  
  // Tags
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  
  // Vendors from API
  const [vendors, setVendors] = useState<Array<{ vendor_id: number; vendor_name: string; email?: string }>>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  // Managers from API
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string; role: string }>>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // Approvers from API
  const [approvers, setApprovers] = useState<Array<{ id: string; full_name: string; role: string }>>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  
  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        console.log('🔄 Fetching vendors from API...');
        
        const response = await apiRequest<{ 
          success: boolean; 
          data?: Array<{ vendor_id: number; vendor_name: string; email?: string }>;
        } | Array<{ vendor_id: number; vendor_name: string; email?: string }>>(
          '/inventory/list'
        );
        
        console.log('📊 Vendors response:', response);
        
        let vendorsData: Array<{ vendor_id: number; vendor_name: string; email?: string }> = [];
        
        if (Array.isArray(response)) {
          vendorsData = response;
        } else if (response && typeof response === 'object') {
          if ('success' in response && response.success && 'data' in response) {
            vendorsData = Array.isArray(response.data) ? response.data : [];
          } else if ('data' in response && Array.isArray(response.data)) {
            vendorsData = response.data;
          }
        }
        
        console.log('✅ Vendors loaded successfully:', vendorsData.length);
        setVendors(vendorsData);
      } catch (err: any) {
        console.error('❌ Error fetching vendors:', err);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };
    
    fetchVendors();
  }, []);
  
  // Fetch managers on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        console.log('🔄 Fetching managers from API...');
        
        const response = await apiRequest<{ 
          success: boolean; 
          data?: Array<{ id: string; full_name: string; role: string }>;
        } | Array<{ id: string; full_name: string; role: string }>>(
          '/procurement/managers/list'
        );
        
        console.log('📊 Managers response:', response);
        
        let managersData: Array<{ id: string; full_name: string; role: string }> = [];
        
        if (Array.isArray(response)) {
          managersData = response;
        } else if (response && typeof response === 'object') {
          if ('success' in response && response.success && 'data' in response) {
            managersData = Array.isArray(response.data) ? response.data : [];
          } else if ('data' in response && Array.isArray(response.data)) {
            managersData = response.data;
          }
        }
        
        console.log('✅ Managers loaded successfully:', managersData.length);
        setManagers(managersData);
      } catch (err: any) {
        console.error('❌ Error fetching managers:', err);
        setManagers([]);
      } finally {
        setLoadingManagers(false);
      }
    };
    
    fetchManagers();
  }, []);
  
  // Fetch approvers on component mount
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true);
        console.log('🔄 Fetching approvers from API...');
        
        const response = await apiRequest<{ 
          success: boolean; 
          data?: Array<{ id: string; full_name: string; role: string }>;
        } | Array<{ id: string; full_name: string; role: string }>>(
          '/procurement/approved/list'
        );
        
        console.log('📊 Approvers response:', response);
        
        let approversData: Array<{ id: string; full_name: string; role: string }> = [];
        
        if (Array.isArray(response)) {
          approversData = response;
        } else if (response && typeof response === 'object') {
          if ('success' in response && response.success && 'data' in response) {
            approversData = Array.isArray(response.data) ? response.data : [];
          } else if ('data' in response && Array.isArray(response.data)) {
            approversData = response.data;
          }
        }
        
        console.log('✅ Approvers loaded successfully:', approversData.length);
        setApprovers(approversData);
      } catch (err: any) {
        console.error('❌ Error fetching approvers:', err);
        setApprovers([]);
      } finally {
        setLoadingApprovers(false);
      }
    };
    
    fetchApprovers();
  }, []);
  
  // Convert vendors to SearchableSelect options format
  const vendorOptions = useMemo(() => {
    return vendors.map((vendor) => ({
      value: vendor.vendor_id.toString(),
      label: `${vendor.vendor_id} - ${vendor.vendor_name}`,
      id: vendor.vendor_id,
    }));
  }, [vendors]);
  
  // Convert managers to SearchableSelect options format
  const managerOptions = useMemo(() => {
    return managers.map((manager) => ({
      value: manager.id.toString(),
      label: `${manager.id} - ${manager.full_name}`,
      id: manager.id,
    }));
  }, [managers]);
  
  // Convert approvers to SearchableSelect options format
  const approverOptions = useMemo(() => {
    return approvers.map((approver) => ({
      value: approver.id.toString(),
      label: `${approver.id} - ${approver.full_name}`,
      id: approver.id,
    }));
  }, [approvers]);
  
  // Handle vendor selection - auto-populate supplier name and email
  const handleVendorChange = (vendorId: string) => {
    setSupplierId(vendorId);
    const selectedVendor = vendors.find(v => v.vendor_id.toString() === vendorId);
    if (selectedVendor) {
      setSupplier(selectedVendor.vendor_name);
      if (selectedVendor.email) {
        setSupplierEmail(selectedVendor.email);
      }
      console.log('✅ Auto-populated supplier name:', selectedVendor.vendor_name);
      console.log('✅ Auto-populated supplier email:', selectedVendor.email);
    }
  };
  
  // Handle manager selection - auto-populate requested by name with role
  const handleManagerChange = (managerId: string) => {
    setRequestedById(managerId);
    const selectedManager = managers.find(m => m.id.toString() === managerId);
    if (selectedManager) {
      // Format: "Full Name - Role"
      setRequestedBy(`${selectedManager.full_name} - ${selectedManager.role}`);
      console.log('✅ Auto-populated requested by:', selectedManager.full_name);
      console.log('✅ Auto-populated role:', selectedManager.role);
    }
  };
  
  // Handle approver selection - auto-populate approved by with role
  const handleApproverChange = (approverId: string) => {
    setApprovedById(approverId);
    const selectedApprover = approvers.find(a => a.id.toString() === approverId);
    if (selectedApprover) {
      // Auto-populate with role only
      setApprovedBy(selectedApprover.role);
      console.log('✅ Auto-populated approved by role:', selectedApprover.role);
      console.log('✅ Approver name:', selectedApprover.full_name);
    }
  };

  // Auto-calculate total amount
  useEffect(() => {
    const subtotalVal = parseFloat(subtotal) || 0;
    const taxVal = parseFloat(taxAmount) || 0;
    const shippingVal = parseFloat(shippingCost) || 0;
    const discountVal = parseFloat(discountAmount) || 0;
    const calculatedTotal = subtotalVal + taxVal + shippingVal - discountVal;
    setTotalAmount(calculatedTotal.toFixed(2));
  }, [subtotal, taxAmount, shippingCost, discountAmount]);

  // Auto-calculate advance payment amount from percentage
  useEffect(() => {
    if (advancePaymentRequired && advancePaymentPercentage && totalAmount) {
      const percentage = parseFloat(advancePaymentPercentage) || 0;
      const total = parseFloat(totalAmount) || 0;
      const calculated = (total * percentage) / 100;
      setAdvancePaymentAmount(calculated.toFixed(2));
    }
  }, [advancePaymentRequired, advancePaymentPercentage, totalAmount]);

  // Auto-calculate pending quantity
  useEffect(() => {
    const total = parseFloat(totalQuantity) || 0;
    const received = parseFloat(receivedQuantity) || 0;
    const pending = total - received;
    setPendingQuantity(pending.toString());
  }, [totalQuantity, receivedQuantity]);

  // Auto-set payment terms days based on payment terms
  useEffect(() => {
    const termsMap: Record<PaymentTerms, string> = {
      NET_15: '15',
      NET_30: '30',
      NET_45: '45',
      NET_60: '60',
      NET_90: '90',
      ADVANCE: '0',
      COD: '0',
      CUSTOM: paymentTermsDays
    };
    if (paymentTerms !== 'CUSTOM') {
      setPaymentTermsDays(termsMap[paymentTerms]);
    }
  }, [paymentTerms]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const payload: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'> = {
      po_number: poNumber,
      reference_number: referenceNumber || undefined,
      requisition_number: requisitionNumber || undefined,
      supplier,
      supplier_id: supplierId || undefined,
      supplier_contact_person: supplierContactPerson || undefined,
      supplier_email: supplierEmail || undefined,
      supplier_phone: supplierPhone || undefined,
      date,
      expected_delivery_date: expectedDeliveryDate || undefined,
      actual_delivery_date: actualDeliveryDate || undefined,
      due_date: dueDate || undefined,
      status,
      priority,
      subtotal: parseFloat(subtotal),
      tax_amount: taxAmount ? parseFloat(taxAmount) : undefined,
      shipping_cost: shippingCost ? parseFloat(shippingCost) : undefined,
      discount_amount: discountAmount ? parseFloat(discountAmount) : undefined,
      total_amount: parseFloat(totalAmount),
      currency,
      exchange_rate: exchangeRate ? parseFloat(exchangeRate) : undefined,
      payment_terms: paymentTerms,
      payment_terms_days: paymentTermsDays ? parseInt(paymentTermsDays) : undefined,
      advance_payment_required: advancePaymentRequired,
      advance_payment_amount: advancePaymentAmount ? parseFloat(advancePaymentAmount) : undefined,
      advance_payment_percentage: advancePaymentPercentage ? parseFloat(advancePaymentPercentage) : undefined,
      delivery_address: deliveryAddress || undefined,
      delivery_city: deliveryCity || undefined,
      delivery_state: deliveryState || undefined,
      delivery_postal_code: deliveryPostalCode || undefined,
      delivery_country: deliveryCountry || undefined,
      delivery_method: deliveryMethod || undefined,
      tracking_number: trackingNumber || undefined,
      items_count: itemsCount ? parseInt(itemsCount) : undefined,
      total_quantity: totalQuantity ? parseFloat(totalQuantity) : undefined,
      requested_by: requestedBy || undefined,
      requested_by_id: requestedById || undefined,
      approved_by: approvedBy || undefined,
      approved_by_id: approvedById || undefined,
      approval_date: approvalDate || undefined,
      department: department || undefined,
      project_id: projectId || undefined,
      cost_center: costCenter || undefined,
      description: description || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
      terms_and_conditions: termsAndConditions || undefined,
      received_quantity: receivedQuantity ? parseFloat(receivedQuantity) : undefined,
      pending_quantity: pendingQuantity ? parseFloat(pendingQuantity) : undefined,
      quality_check_required: qualityCheckRequired,
      quality_check_passed: qualityCheckPassed,
      inspected_by: inspectedBy || undefined,
      inspection_date: inspectionDate || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PO Identification */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Purchase Order Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              PO Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="PO-2025-0001"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Reference Number
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="REQ-2025-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Requisition Number
            </label>
            <Input
              value={requisitionNumber}
              onChange={(e) => setRequisitionNumber(e.target.value)}
              placeholder="PR-2025-001"
            />
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Supplier Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder={supplierId ? "Auto-populated from vendor" : "Industrial Suppliers Ltd"}
              required
              className={supplierId ? "bg-slate-50" : ""}
              readOnly={!!supplierId}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Supplier ID (Vendor)
            </label>
            {loadingVendors ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading vendors...
              </div>
            ) : vendors.length === 0 ? (
              <Input
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="SUP-001"
              />
            ) : (
              <SearchableSelect
                value={supplierId}
                onChange={handleVendorChange}
                options={vendorOptions}
                placeholder="Search and select vendor..."
                maxHeight="200px"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Person
            </label>
            <Input
              value={supplierContactPerson}
              onChange={(e) => setSupplierContactPerson(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Email
            </label>
            <Input
              type="email"
              value={supplierEmail}
              onChange={(e) => setSupplierEmail(e.target.value)}
              placeholder={supplierId ? "Auto-populated from vendor" : "contact@supplier.com"}
              className={supplierId ? "bg-slate-50" : ""}
              readOnly={!!supplierId}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Phone
            </label>
            <Input
              type="tel"
              value={supplierPhone}
              onChange={(e) => setSupplierPhone(e.target.value)}
              placeholder="+1-555-0301"
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
              PO Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Expected Delivery Date
            </label>
            <Input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Actual Delivery Date
            </label>
            <Input
              type="date"
              value={actualDeliveryDate}
              onChange={(e) => setActualDeliveryDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
            <Select value={status} onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)} required>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="SENT">Sent to Supplier</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Priority <span className="text-red-500">*</span>
            </label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as PurchaseOrderPriority)} required>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Financial Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Subtotal <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} required>
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tax Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Shipping Cost
            </label>
            <Input
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Discount Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Total Amount (Auto-calculated)
            </label>
            <Input
              type="number"
              step="0.01"
              value={totalAmount}
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Exchange Rate
            </label>
            <Input
              type="number"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="1.0000"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <Select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)} required>
              <option value="NET_15">Net 15 Days</option>
              <option value="NET_30">Net 30 Days</option>
              <option value="NET_45">Net 45 Days</option>
              <option value="NET_60">Net 60 Days</option>
              <option value="NET_90">Net 90 Days</option>
              <option value="ADVANCE">Advance Payment</option>
              <option value="COD">Cash on Delivery</option>
              <option value="CUSTOM">Custom</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Terms (Days)
            </label>
            <Input
              type="number"
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(e.target.value)}
              placeholder="30"
              disabled={paymentTerms !== 'CUSTOM'}
            />
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="advancePaymentRequired"
                checked={advancePaymentRequired}
                onChange={(e) => setAdvancePaymentRequired(e.target.checked)}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="advancePaymentRequired" className="text-xs font-medium text-slate-700">
                Advance Payment Required
              </label>
            </div>
          </div>
          {advancePaymentRequired && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Advance Payment Percentage
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={advancePaymentPercentage}
                  onChange={(e) => setAdvancePaymentPercentage(e.target.value)}
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Advance Payment Amount (Auto-calculated)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={advancePaymentAmount}
                  readOnly
                  className="bg-slate-50"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delivery Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Delivery Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Delivery Address
            </label>
            <Input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="123 Manufacturing St"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              City
            </label>
            <Input
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              placeholder="Detroit"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              State/Province
            </label>
            <Input
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              placeholder="MI"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Postal Code
            </label>
            <Input
              value={deliveryPostalCode}
              onChange={(e) => setDeliveryPostalCode(e.target.value)}
              placeholder="48201"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Country
            </label>
            <Input
              value={deliveryCountry}
              onChange={(e) => setDeliveryCountry(e.target.value)}
              placeholder="USA"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Delivery Method
            </label>
            <Select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}>
              <option value="STANDARD">Standard</option>
              <option value="EXPRESS">Express</option>
              <option value="FREIGHT">Freight</option>
              <option value="COURIER">Courier</option>
              <option value="PICKUP">Pickup</option>
              <option value="DROP_SHIPPING">Drop Shipping</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tracking Number
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="TRK-123456789"
            />
          </div>
        </div>
      </div>

      {/* Items Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Items Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Number of Items
            </label>
            <Input
              type="number"
              value={itemsCount}
              onChange={(e) => setItemsCount(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Total Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              placeholder="500"
            />
          </div>
        </div>
      </div>

      {/* Approval & Workflow */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Approval & Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Requested By
            </label>
            <Input
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder={requestedById ? "Auto-populated from manager" : "Production Manager"}
              className={requestedById ? "bg-slate-50" : ""}
              readOnly={!!requestedById}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Requested By ID
            </label>
            {loadingManagers ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading managers...
              </div>
            ) : managers.length === 0 ? (
              <Input
                value={requestedById}
                onChange={(e) => setRequestedById(e.target.value)}
                placeholder="emp-001"
              />
            ) : (
              <SearchableSelect
                value={requestedById}
                onChange={handleManagerChange}
                options={managerOptions}
                placeholder="Search and select manager..."
                maxHeight="200px"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approved By
            </label>
            <Input
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              placeholder={approvedById ? "Auto-populated from approver" : "Operations Director"}
              className={approvedById ? "bg-slate-50" : ""}
              readOnly={!!approvedById}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approved By ID
            </label>
            {loadingApprovers ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Loading approvers...
              </div>
            ) : approvers.length === 0 ? (
              <Input
                value={approvedById}
                onChange={(e) => setApprovedById(e.target.value)}
                placeholder="emp-002"
              />
            ) : (
              <SearchableSelect
                value={approvedById}
                onChange={handleApproverChange}
                options={approverOptions}
                placeholder="Search and select approver..."
                maxHeight="200px"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Approval Date
            </label>
            <Input
              type="date"
              value={approvalDate}
              onChange={(e) => setApprovalDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Department & Project */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Department & Project
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Cost Center
            </label>
            <Input
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="CC-PROD-01"
            />
          </div>
        </div>
      </div>

      {/* Receiving Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Receiving Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Received Quantity
            </label>
            <Input
              type="number"
              step="0.01"
              value={receivedQuantity}
              onChange={(e) => setReceivedQuantity(e.target.value)}
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
              value={pendingQuantity}
              readOnly
              className="bg-slate-50"
            />
          </div>
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
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="qualityCheckPassed"
                    checked={qualityCheckPassed}
                    onChange={(e) => setQualityCheckPassed(e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="qualityCheckPassed" className="text-xs font-medium text-slate-700">
                    Quality Check Passed
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Inspected By
                </label>
                <Input
                  value={inspectedBy}
                  onChange={(e) => setInspectedBy(e.target.value)}
                  placeholder="QC Team"
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
            </>
          )}
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
              placeholder="Brief description of the purchase order"
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
              placeholder="Internal notes (not visible to supplier)"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Terms and Conditions
            </label>
            <Textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Terms and conditions for this purchase order"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tags (comma-separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="raw-materials, production, urgent"
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
          {initial ? 'Update Purchase Order' : 'Create Purchase Order'}
        </Button>
      </div>
    </form>
  );
}
