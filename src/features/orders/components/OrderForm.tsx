import { FormEvent, useState, useEffect } from 'react';
import type { SalesOrder, SalesOrderStatus, PaymentStatus, PaymentTerms, ShippingMethod, OrderPriority, OrderSource } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<SalesOrder>;
  onSubmit: (values: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate order number
function generateOrderNumber(): string {
  const prefix = 'SO';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function OrderForm({ initial, onSubmit, onCancel }: Props) {
  const [orderNumber, setOrderNumber] = useState(initial?.order_number ?? generateOrderNumber());
  const [customer, setCustomer] = useState(initial?.customer ?? '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customer_phone ?? '');
  const [customerEmail, setCustomerEmail] = useState(initial?.customer_email ?? '');
  const [contactPerson, setContactPerson] = useState(initial?.contact_person ?? '');
  
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(initial?.expected_delivery_date ?? '');
  
  const [status, setStatus] = useState<SalesOrderStatus>(initial?.status ?? 'PENDING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initial?.payment_status ?? 'UNPAID');
  const [priority, setPriority] = useState<OrderPriority>(initial?.priority ?? 'MEDIUM');
  
  const [shippingAddress, setShippingAddress] = useState(initial?.shipping_address ?? '');
  const [shippingCity, setShippingCity] = useState(initial?.shipping_city ?? '');
  const [shippingState, setShippingState] = useState(initial?.shipping_state ?? '');
  const [shippingPostalCode, setShippingPostalCode] = useState(initial?.shipping_postal_code ?? '');
  const [shippingCountry, setShippingCountry] = useState(initial?.shipping_country ?? '');
  const [billingAddress, setBillingAddress] = useState(initial?.billing_address ?? '');
  
  const [subtotal, setSubtotal] = useState<number | ''>(initial?.subtotal ?? '');
  const [taxAmount, setTaxAmount] = useState<number | ''>(initial?.tax_amount ?? '');
  const [shippingCost, setShippingCost] = useState<number | ''>(initial?.shipping_cost ?? '');
  const [discountAmount, setDiscountAmount] = useState<number | ''>(initial?.discount_amount ?? '');
  const [totalAmount, setTotalAmount] = useState<number | ''>(initial?.total_amount ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(initial?.payment_terms ?? 'NET_30');
  const [paymentDueDate, setPaymentDueDate] = useState(initial?.payment_due_date ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? '');
  const [customerPoNumber, setCustomerPoNumber] = useState(initial?.customer_po_number ?? '');
  
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(initial?.shipping_method ?? 'STANDARD');
  const [trackingNumber, setTrackingNumber] = useState(initial?.tracking_number ?? '');
  const [warehouseLocation, setWarehouseLocation] = useState(initial?.warehouse_location ?? '');
  
  const [salesRepresentative, setSalesRepresentative] = useState(initial?.sales_representative ?? '');
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '');
  const [orderSource, setOrderSource] = useState<OrderSource>(initial?.order_source ?? 'ONLINE');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Calculate total when subtotal, tax, shipping, or discount changes
  useEffect(() => {
    const sub = Number(subtotal) || 0;
    const tax = Number(taxAmount) || 0;
    const shipping = Number(shippingCost) || 0;
    const discount = Number(discountAmount) || 0;
    const calculatedTotal = sub + tax + shipping - discount;
    if (calculatedTotal >= 0) {
      setTotalAmount(calculatedTotal);
    }
  }, [subtotal, taxAmount, shippingCost, discountAmount]);

  // Calculate payment due date based on payment terms
  useEffect(() => {
    if (paymentTerms && date) {
      const orderDate = new Date(date);
      let daysToAdd = 0;
      
      switch (paymentTerms) {
        case 'DUE_ON_RECEIPT':
          daysToAdd = 0;
          break;
        case 'NET_15':
          daysToAdd = 15;
          break;
        case 'NET_30':
          daysToAdd = 30;
          break;
        case 'NET_60':
          daysToAdd = 60;
          break;
        case 'NET_90':
          daysToAdd = 90;
          break;
        default:
          daysToAdd = 30;
      }
      
      const dueDate = new Date(orderDate);
      dueDate.setDate(dueDate.getDate() + daysToAdd);
      setPaymentDueDate(dueDate.toISOString().slice(0, 10));
    }
  }, [paymentTerms, date]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customer || totalAmount === '' || !date) return;
    
    onSubmit({
      order_number: orderNumber,
      customer,
      customer_phone: customerPhone || undefined,
      customer_email: customerEmail || undefined,
      contact_person: contactPerson || undefined,
      date,
      expected_delivery_date: expectedDeliveryDate || undefined,
      status,
      payment_status: paymentStatus,
      priority,
      shipping_address: shippingAddress || undefined,
      shipping_city: shippingCity || undefined,
      shipping_state: shippingState || undefined,
      shipping_postal_code: shippingPostalCode || undefined,
      shipping_country: shippingCountry || undefined,
      billing_address: billingAddress || undefined,
      subtotal: Number(subtotal) || undefined,
      tax_amount: Number(taxAmount) || undefined,
      shipping_cost: Number(shippingCost) || undefined,
      discount_amount: Number(discountAmount) || undefined,
      total_amount: Number(totalAmount),
      currency,
      payment_terms: paymentTerms,
      payment_due_date: paymentDueDate || undefined,
      invoice_number: invoiceNumber || undefined,
      customer_po_number: customerPoNumber || undefined,
      shipping_method: shippingMethod,
      tracking_number: trackingNumber || undefined,
      warehouse_location: warehouseLocation || undefined,
      sales_representative: salesRepresentative || undefined,
      assigned_to: assignedTo || undefined,
      order_source: orderSource,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Order Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Order Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Order Number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Auto-generated"
          />
          <Input
            label="Order Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SalesOrderStatus)}
            required
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as OrderPriority)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
          <Select
            label="Order Source"
            value={orderSource}
            onChange={(e) => setOrderSource(e.target.value as OrderSource)}
          >
            <option value="ONLINE">Online</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="SALES_REP">Sales Rep</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Customer Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Customer Name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer name or company"
            required
          />
          <Input
            label="Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Contact person name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone Number"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
          <Input
            label="Email Address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Shipping Address</h3>
        <Textarea
          label="Shipping Address"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Street address"
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="City"
            value={shippingCity}
            onChange={(e) => setShippingCity(e.target.value)}
            placeholder="City"
          />
          <Input
            label="State/Province"
            value={shippingState}
            onChange={(e) => setShippingState(e.target.value)}
            placeholder="State"
          />
          <Input
            label="Postal Code"
            value={shippingPostalCode}
            onChange={(e) => setShippingPostalCode(e.target.value)}
            placeholder="ZIP/Postal"
          />
          <Input
            label="Country"
            value={shippingCountry}
            onChange={(e) => setShippingCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
        <Textarea
          label="Billing Address (if different)"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="Billing address (leave blank if same as shipping)"
          rows={2}
        />
      </div>

      {/* Financial Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Financial Details</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Subtotal"
            type="number"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Tax Amount"
            type="number"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Shipping Cost"
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Discount Amount"
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total Amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
            required
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
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </Select>
        </div>
      </div>

      {/* Payment & Terms */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Payment & Terms</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </Select>
          <Select
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
          >
            <option value="DUE_ON_RECEIPT">Due on Receipt</option>
            <option value="NET_15">Net 15</option>
            <option value="NET_30">Net 30</option>
            <option value="NET_60">Net 60</option>
            <option value="NET_90">Net 90</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          <Input
            label="Payment Due Date"
            type="date"
            value={paymentDueDate}
            onChange={(e) => setPaymentDueDate(e.target.value)}
          />
          <Input
            label="Customer PO Number"
            value={customerPoNumber}
            onChange={(e) => setCustomerPoNumber(e.target.value)}
            placeholder="Customer PO#"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Invoice #"
          />
        </div>
      </div>

      {/* Shipping & Fulfillment */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Shipping & Fulfillment</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Shipping Method"
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
          >
            <option value="STANDARD">Standard</option>
            <option value="EXPRESS">Express</option>
            <option value="OVERNIGHT">Overnight</option>
            <option value="PICKUP">Pickup</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            min={date}
          />
          <Input
            label="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking #"
          />
          <Input
            label="Warehouse Location"
            value={warehouseLocation}
            onChange={(e) => setWarehouseLocation(e.target.value)}
            placeholder="WH-01"
          />
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Assignment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sales Representative"
            value={salesRepresentative}
            onChange={(e) => setSalesRepresentative(e.target.value)}
            placeholder="Sales rep name"
          />
          <Input
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Assigned user"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Customer Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes visible to customer"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (not visible to customer)"
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
          {initial ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}
