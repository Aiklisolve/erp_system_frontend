import { FormEvent, useState, useEffect } from 'react';
import type { SupplyChainDelivery, DeliveryStatus, QualityStatus, PaymentStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { listPurchaseOrders } from '../../procurement/api/procurementApi';
import { listWarehouses } from '../../warehouse/api/warehouseApi';
import { listVendors } from '../../inventory/api/inventoryApi';
import type { PurchaseOrder } from '../../procurement/types';
import type { Warehouse } from '../../warehouse/types';
import type { Vendor } from '../../inventory/types';

type Props = {
  initial?: Partial<SupplyChainDelivery>;
  onSubmit: (values: Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
};

export function SupplyChainDeliveryForm({ initial, onSubmit, onCancel, isLoading = false }: Props) {
  // Core Information
  const [purchaseOrderId, setPurchaseOrderId] = useState<number | ''>(initial?.purchase_order_id ?? '');
  const [supplierId, setSupplierId] = useState<number | ''>(initial?.supplier_id ?? '');
  const [warehouseId, setWarehouseId] = useState<number | ''>(initial?.warehouse_id ?? '');
  const [deliveryDate, setDeliveryDate] = useState(initial?.delivery_date ?? '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initial?.expected_delivery_date ?? '');
  
  // Status & Tracking
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(initial?.delivery_status ?? 'PENDING');
  
  // Quantity & Quality
  const [orderedQuantity, setOrderedQuantity] = useState<number | ''>(initial?.ordered_quantity ?? '');
  const [receivedQuantity, setReceivedQuantity] = useState<number | ''>(initial?.received_quantity ?? '');
  const [acceptedQuantity, setAcceptedQuantity] = useState<number | ''>(initial?.accepted_quantity ?? '');
  const [rejectedQuantity, setRejectedQuantity] = useState<number | ''>(initial?.rejected_quantity ?? '');
  const [qualityStatus, setQualityStatus] = useState<QualityStatus>(initial?.quality_status ?? 'PENDING_INSPECTION');
  const [inspectionNotes, setInspectionNotes] = useState(initial?.inspection_notes ?? '');
  
  // Financial
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? '');
  const [invoiceAmount, setInvoiceAmount] = useState<number | ''>(initial?.invoice_amount ?? '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initial?.payment_status ?? 'PENDING');
  const [paymentDate, setPaymentDate] = useState(initial?.payment_date ?? '');
  
  // Additional
  const [receivedBy, setReceivedBy] = useState(initial?.received_by ?? '');
  const [inspectedBy, setInspectedBy] = useState(initial?.inspected_by ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  
  const [error, setError] = useState<string | null>(null);
  
  // Fetch purchase orders, vendors, and warehouses
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    console.log('🚀 SupplyChainDeliveryForm mounted - Starting to fetch data...');
    const fetchData = async () => {
      setLoadingData(true);
      console.log('📡 Calling APIs: listPurchaseOrders(), listVendors(), listWarehouses()');
      try {
        console.log('⏳ API calls started at:', new Date().toISOString());
        let pos, vens, whs;
        try {
          console.log('📞 Calling listPurchaseOrders()...');
          pos = await listPurchaseOrders();
          console.log('✅ listPurchaseOrders() completed:', pos?.length || 0);
        } catch (err) {
          console.error('❌ listPurchaseOrders() failed:', err);
          pos = [];
        }
        try {
          console.log('📞 Calling listVendors()...');
          vens = await listVendors();
          console.log('✅ listVendors() completed:', vens?.length || 0);
        } catch (err) {
          console.error('❌ listVendors() failed:', err);
          vens = [];
        }
        try {
          console.log('📞 Calling listWarehouses()...');
          whs = await listWarehouses();
          console.log('✅ listWarehouses() completed:', whs?.length || 0);
        } catch (err) {
          console.error('❌ listWarehouses() failed:', err);
          whs = [];
        }
        console.log('⏳ All API calls completed at:', new Date().toISOString());
        console.log('✅ Fetched data for Supply Chain Delivery Form:', { 
          purchaseOrders: pos?.length || 0, 
          vendors: vens?.length || 0, 
          warehouses: whs?.length || 0
        });
        console.log('📦 Purchase Orders (raw):', pos);
        console.log('🏢 Vendors (raw):', vens);
        console.log('🏭 Warehouses (raw):', whs);
        const purchaseOrdersArray = Array.isArray(pos) ? pos : [];
        const vendorsArray = Array.isArray(vens) ? vens : [];
        const warehousesArray = Array.isArray(whs) ? whs : [];
        
        console.log('📊 Processed arrays:', {
          purchaseOrders: purchaseOrdersArray.length,
          vendors: vendorsArray.length,
          warehouses: warehousesArray.length,
          purchaseOrdersSample: purchaseOrdersArray.slice(0, 2),
          vendorsSample: vendorsArray.slice(0, 2),
          warehousesSample: warehousesArray.slice(0, 2)
        });
        
        console.log('💾 Setting state with arrays...');
        setPurchaseOrders(purchaseOrdersArray);
        setVendors(vendorsArray);
        setWarehouses(warehousesArray);
        console.log('✅ State set successfully');
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        console.error('❌ Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        // Set empty arrays on error to prevent undefined issues
        setPurchaseOrders([]);
        setVendors([]);
        setWarehouses([]);
      } finally {
        setLoadingData(false);
        console.log('🏁 Data fetching completed, loadingData set to false');
      }
    };
    fetchData();
  }, []);

  // Auto-fill form when initial changes (for edit mode)
  useEffect(() => {
    if (initial) {
      if (initial.purchase_order_id) setPurchaseOrderId(Number(initial.purchase_order_id));
      if (initial.supplier_id) setSupplierId(Number(initial.supplier_id));
      if (initial.warehouse_id) setWarehouseId(Number(initial.warehouse_id));
      if (initial.delivery_date) setDeliveryDate(initial.delivery_date);
      if (initial.expected_delivery_date) setExpectedDeliveryDate(initial.expected_delivery_date);
      if (initial.delivery_status) setDeliveryStatus(initial.delivery_status);
      if (initial.ordered_quantity !== undefined) setOrderedQuantity(initial.ordered_quantity);
      if (initial.received_quantity !== undefined) setReceivedQuantity(initial.received_quantity);
      if (initial.accepted_quantity !== undefined) setAcceptedQuantity(initial.accepted_quantity);
      if (initial.rejected_quantity !== undefined) setRejectedQuantity(initial.rejected_quantity);
      if (initial.quality_status) setQualityStatus(initial.quality_status);
      if (initial.inspection_notes) setInspectionNotes(initial.inspection_notes);
      if (initial.invoice_number) setInvoiceNumber(initial.invoice_number);
      if (initial.invoice_amount !== undefined) setInvoiceAmount(initial.invoice_amount);
      if (initial.payment_status) setPaymentStatus(initial.payment_status);
      if (initial.payment_date) setPaymentDate(initial.payment_date);
      if (initial.received_by) setReceivedBy(initial.received_by);
      if (initial.inspected_by) setInspectedBy(initial.inspected_by);
      if (initial.notes) setNotes(initial.notes);
    }
  }, [initial]);

  // Debug: Log when data changes
  useEffect(() => {
    console.log('📊 Form state updated:', {
      purchaseOrdersCount: purchaseOrders.length,
      vendorsCount: vendors.length,
      warehousesCount: warehouses.length,
      loadingData,
      purchaseOrderId,
      supplierId,
      warehouseId
    });
  }, [purchaseOrders, vendors, warehouses, loadingData, purchaseOrderId, supplierId, warehouseId]);

  // Auto-fill supplier when PO is selected (only for new deliveries, not edit mode)
  useEffect(() => {
    if (purchaseOrderId && purchaseOrders.length > 0 && !initial) {
      const po = purchaseOrders.find(p => Number(p.id) === Number(purchaseOrderId));
      if (po && po.supplier_id) {
        setSupplierId(Number(po.supplier_id));
      }
      if (po && po.expected_delivery_date) {
        setExpectedDeliveryDate(po.expected_delivery_date);
      }
      if (po && po.total_quantity) {
        setOrderedQuantity(po.total_quantity);
      }
    }
  }, [purchaseOrderId, purchaseOrders, initial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!purchaseOrderId || !supplierId || !deliveryStatus) {
      setError('Please fill in all required fields');
      return;
    }

    if (receivedQuantity !== '' && orderedQuantity !== '' && Number(receivedQuantity) > Number(orderedQuantity)) {
      setError('Received quantity cannot exceed ordered quantity');
      return;
    }

    if (acceptedQuantity !== '' && rejectedQuantity !== '' && receivedQuantity !== '') {
      const total = Number(acceptedQuantity) + Number(rejectedQuantity);
      if (total > Number(receivedQuantity)) {
        setError('Accepted + Rejected quantity cannot exceed received quantity');
        return;
      }
    }

    setError(null);

    onSubmit({
      delivery_number: initial?.delivery_number || undefined, // Only include for edit mode, backend will generate for new
      purchase_order_id: Number(purchaseOrderId),
      supplier_id: Number(supplierId),
      warehouse_id: warehouseId !== '' ? Number(warehouseId) : undefined,
      delivery_date: deliveryDate || undefined,
      expected_delivery_date: expectedDeliveryDate || undefined,
      delivery_status: deliveryStatus,
      // tracking_number will be auto-generated by backend
      ordered_quantity: Number(orderedQuantity) || 0,
      received_quantity: Number(receivedQuantity) || 0,
      accepted_quantity: Number(acceptedQuantity) || 0,
      rejected_quantity: Number(rejectedQuantity) || 0,
      quality_status: qualityStatus,
      inspection_notes: inspectionNotes || undefined,
      invoice_number: invoiceNumber || undefined,
      invoice_amount: invoiceAmount !== '' ? Number(invoiceAmount) : undefined,
      payment_status: paymentStatus,
      payment_date: paymentDate || undefined,
      received_by: receivedBy || undefined,
      inspected_by: inspectedBy || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {error && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px]">
          {error}
        </div>
      )}

      {/* Core Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Core Information</h3>
        
        {initial?.delivery_number && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
            <span className="font-medium">Delivery Number:</span> {initial.delivery_number}
          </div>
        )}

        <div>
          <Select
            label="Purchase Order"
            value={purchaseOrderId === '' ? '' : String(purchaseOrderId)}
            onChange={(e) => setPurchaseOrderId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loadingData}
            required
          >
          <option value="">{loadingData ? 'Loading...' : 'Select Purchase Order'}</option>
          {(() => {
            console.log('🔍 Rendering PO dropdown:', {
              purchaseOrdersIsArray: Array.isArray(purchaseOrders),
              purchaseOrdersLength: purchaseOrders?.length || 0,
              purchaseOrders: purchaseOrders,
              loadingData
            });
            if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
              return purchaseOrders.map((po) => {
                const poId = typeof po.id === 'string' ? parseInt(po.id, 10) : Number(po.id);
                const displayText = po.po_number ? `${po.po_number} (ID: ${poId})` : `ID: ${poId}`;
                console.log('📝 Rendering PO option:', { poId, po_number: po.po_number, displayText, originalId: po.id });
                return (
                  <option key={po.id || po.po_number} value={String(poId)}>
                    {displayText}
                  </option>
                );
              });
            } else if (!loadingData) {
              return <option value="" disabled>No purchase orders available ({purchaseOrders?.length || 0})</option>;
            }
            return null;
          })()}
          </Select>
          {!loadingData && (!Array.isArray(purchaseOrders) || purchaseOrders.length === 0) && (
            <p className="text-[10px] text-red-500 mt-1">No purchase orders found. Check console for details.</p>
          )}
        </div>

        <div>
          <Select
            label="Supplier"
            value={supplierId === '' ? '' : String(supplierId)}
            onChange={(e) => setSupplierId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loadingData}
            required
          >
          <option value="">{loadingData ? 'Loading...' : 'Select Supplier'}</option>
          {(() => {
            console.log('🔍 Rendering Supplier dropdown:', {
              vendorsIsArray: Array.isArray(vendors),
              vendorsLength: vendors?.length || 0,
              vendors: vendors,
              loadingData
            });
            if (Array.isArray(vendors) && vendors.length > 0) {
              return vendors.map((vendor) => {
                const vendorId = typeof vendor.id === 'string' ? parseInt(vendor.id, 10) : Number(vendor.id);
                console.log('📝 Rendering Vendor option:', { vendorId, vendor_name: vendor.vendor_name, originalId: vendor.id });
                return (
                  <option key={vendor.id} value={String(vendorId)}>
                    {vendor.vendor_name || 'N/A'}
                  </option>
                );
              });
            } else if (!loadingData) {
              return <option value="" disabled>No suppliers available ({vendors?.length || 0})</option>;
            }
            return null;
          })()}
          </Select>
          {!loadingData && (!Array.isArray(vendors) || vendors.length === 0) && (
            <p className="text-[10px] text-red-500 mt-1">No suppliers found. Check console for details.</p>
          )}
        </div>

        <div>
          <Select
            label="Warehouse"
            value={warehouseId === '' ? '' : String(warehouseId)}
            onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loadingData}
          >
            <option value="">{loadingData ? 'Loading...' : 'Select Warehouse'}</option>
            {(() => {
              console.log('🔍 Rendering Warehouse dropdown:', {
                warehousesIsArray: Array.isArray(warehouses),
                warehousesLength: warehouses?.length || 0,
                warehouses: warehouses,
                loadingData
              });
              if (Array.isArray(warehouses) && warehouses.length > 0) {
                return warehouses.map((wh) => {
                  const whId = typeof wh.id === 'string' ? parseInt(wh.id, 10) : Number(wh.id);
                  console.log('📝 Rendering Warehouse option:', { whId, name: wh.name, warehouse_code: wh.warehouse_code, originalId: wh.id });
                  return (
                    <option key={wh.id} value={String(whId)}>
                      {wh.name} ({wh.warehouse_code})
                    </option>
                  );
                });
              } else if (!loadingData) {
                return <option value="" disabled>No warehouses available ({warehouses?.length || 0})</option>;
              }
              return null;
            })()}
          </Select>
          {!loadingData && (!Array.isArray(warehouses) || warehouses.length === 0) && (
            <p className="text-[10px] text-red-500 mt-1">No warehouses found. Check console for details.</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          />
          <Input
            label="Actual Delivery Date"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>
      </div>

      {/* Status & Tracking */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Status & Tracking</h3>
        
        <Select
          label="Delivery Status"
          value={deliveryStatus}
          onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
          required
        >
          <option value="PENDING">Pending</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="PARTIALLY_RECEIVED">Partially Received</option>
          <option value="RECEIVED">Received</option>
          <option value="DELAYED">Delayed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>

      </div>

      {/* Quantity & Quality */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quantity & Quality</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ordered Quantity"
            type="number"
            value={orderedQuantity}
            onChange={(e) => setOrderedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            required
          />
          <Input
            label="Received Quantity"
            type="number"
            value={receivedQuantity}
            onChange={(e) => setReceivedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Accepted Quantity"
            type="number"
            value={acceptedQuantity}
            onChange={(e) => setAcceptedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
          />
          <Input
            label="Rejected Quantity"
            type="number"
            value={rejectedQuantity}
            onChange={(e) => setRejectedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
          />
        </div>

        <Select
          label="Quality Status"
          value={qualityStatus}
          onChange={(e) => setQualityStatus(e.target.value as QualityStatus)}
        >
          <option value="PENDING_INSPECTION">Pending Inspection</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="PARTIAL">Partial</option>
        </Select>

        <Textarea
          label="Inspection Notes"
          value={inspectionNotes}
          onChange={(e) => setInspectionNotes(e.target.value)}
          placeholder="Quality issues, defects, etc."
          rows={3}
        />
      </div>

      {/* Financial */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Financial</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Supplier invoice reference"
          />
          <Input
            label="Invoice Amount"
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            step={0.01}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>
      </div>

      {/* Additional */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Additional</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Received By"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            placeholder="Person who received goods"
          />
          <Input
            label="Inspected By"
            value={inspectedBy}
            onChange={(e) => setInspectedBy(e.target.value)}
            placeholder="Quality inspector name"
          />
        </div>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="General notes"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initial ? 'Update Delivery' : 'Create Delivery'}
        </Button>
      </div>
    </form>
  );
}

