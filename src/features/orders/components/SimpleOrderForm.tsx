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
  return `₹{prefix}-₹{year}-₹{random}`;
}

export function SimpleOrderForm({ initial, onSubmit, onCancel }: Props) {
  // Essential fields only - matching backend API requirements
  const [orderNumber, setOrderNumber] = useState(initial?.order_number ?? generateOrderNumber());
  const [customer, setCustomer] = useState(initial?.customer ?? '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customer_phone ?? '');
  const [customerEmail, setCustomerEmail] = useState(initial?.customer_email ?? '');
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
  const [subtotal, setSubtotal] = useState<number | ''>(initial?.subtotal ?? '');
  const [taxAmount, setTaxAmount] = useState<number | ''>(initial?.tax_amount ?? '');
  const [shippingCost, setShippingCost] = useState<number | ''>(initial?.shipping_cost ?? '');
  const [discountAmount, setDiscountAmount] = useState<number | ''>(initial?.discount_amount ?? '');
  const [totalAmount, setTotalAmount] = useState<number | ''>(initial?.total_amount ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'INR');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(initial?.payment_terms ?? 'NET_30');
  const [paymentDueDate, setPaymentDueDate] = useState(initial?.payment_due_date ?? '');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(initial?.shipping_method ?? 'STANDARD');
  const [notes, setNotes] = useState(initial?.notes ?? '');

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
    
    // Only send fields that backend API accepts
    onSubmit({
      order_number: orderNumber,
      customer,
      customer_phone: customerPhone || undefined,
      customer_email: customerEmail || undefined,
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
      subtotal: Number(subtotal) || undefined,
      tax_amount: Number(taxAmount) || undefined,
      shipping_cost: Number(shippingCost) || undefined,
      discount_amount: Number(discountAmount) || undefined,
      total_amount: Number(totalAmount),
      currency,
      payment_terms: paymentTerms,
      payment_due_date: paymentDueDate || undefined,
      shipping_method: shippingMethod,
      notes: notes || undefined,
      // Required by frontend type but may not be sent to backend
      contact_person: undefined,
      billing_address: undefined,
      invoice_number: undefined,
      customer_po_number: undefined,
      tracking_number: undefined,
      warehouse_location: undefined,
      sales_representative: undefined,
      assigned_to: undefined,
      order_source: 'ONLINE' as OrderSource,
      internal_notes: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="text-sm text-slate-600 mb-4 p-3 bg-blue-50 rounded border border-blue-200">
        📝 <strong>Backend API Form:</strong> Only essential fields accepted by backend API
      </div>

      {/* Order Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Order Information</h3>
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
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </Select>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Customer Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Customer Name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer name or company"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@example.com"
          />
          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            min={date}
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Shipping Address</h3>
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
        <Select
          label="Shipping Method"
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
        >
          <option value="STANDARD">Standard</option>
          <option value="EXPRESS">Express</option>
          <option value="OVERNIGHT">Overnight</option>
          <option value="PICKUP">Pickup</option>
        </Select>
      </div>

      {/* Financial Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Financial Details</h3>
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
          </Select>
        </div>
      </div>

      {/* Payment & Terms */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Payment & Terms</h3>
        <div className="grid gap-4 sm:grid-cols-2">
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
          </Select>
          <Input
            label="Payment Due Date"
            type="date"
            value={paymentDueDate}
            onChange={(e) => setPaymentDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Notes</h3>
        <Textarea
          label="Order Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this order"
          rows={3}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}

