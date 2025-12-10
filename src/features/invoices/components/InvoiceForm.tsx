import { FormEvent, useState, useEffect } from 'react';
import type { Invoice, InvoiceStatus, InvoiceType, InvoiceItem, PaymentMethod } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import * as crmApi from '../../crm/api/crmApi';
import type { Customer } from '../../crm/types';
import * as ordersApi from '../../orders/api/ordersApi';
import type { SalesOrder } from '../../orders/types';
import * as projectsApi from '../../projects/api/projectsApi';
import type { Project } from '../../projects/types';

type Props = {
  initial?: Partial<Invoice>;
  onSubmit: (values: Partial<Invoice>) => void;
  onCancel?: () => void;
};

// Generate invoice number
function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

export function InvoiceForm({ initial, onSubmit, onCancel }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? generateInvoiceNumber());
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(initial?.invoice_type ?? 'SALES');
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? 'DRAFT');
  
  // Customer Information
  const [customerId, setCustomerId] = useState(initial?.customer_id ?? '');
  const [customerName, setCustomerName] = useState(initial?.customer_name ?? '');
  const [customerEmail, setCustomerEmail] = useState(initial?.customer_email ?? '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customer_phone ?? '');
  const [customerAddress, setCustomerAddress] = useState(initial?.customer_address ?? '');
  const [customerCity, setCustomerCity] = useState(initial?.customer_city ?? '');
  const [customerState, setCustomerState] = useState(initial?.customer_state ?? '');
  const [customerPostalCode, setCustomerPostalCode] = useState(initial?.customer_postal_code ?? '');
  const [customerCountry, setCustomerCountry] = useState(initial?.customer_country ?? '');
  const [customerTaxId, setCustomerTaxId] = useState(initial?.customer_tax_id ?? '');
  
  // Customer dropdown
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initial?.customer_id ?? '');
  
  // Orders dropdown
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(initial?.order_id ?? '');
  
  // Projects dropdown
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(initial?.project_id ?? '');
  
  // Invoice Dates
  const [invoiceDate, setInvoiceDate] = useState(
    initial?.invoice_date ? new Date(initial.invoice_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    initial?.due_date ? new Date(initial.due_date).toISOString().slice(0, 10) : ''
  );
  
  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>(
    initial?.items && initial.items.length > 0
      ? initial.items
      : [
          {
            item_name: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0,
            discount: 0,
            line_total: 0,
            tax_amount: 0,
            total_amount: 0,
          },
        ]
  );
  
  // Financial Information
  const [subtotal, setSubtotal] = useState(initial?.subtotal ?? 0);
  const [taxAmount, setTaxAmount] = useState(initial?.tax_amount ?? 0);
  const [discountAmount, setDiscountAmount] = useState(initial?.discount_amount ?? 0);
  const [shippingAmount, setShippingAmount] = useState(initial?.shipping_amount ?? 0);
  const [totalAmount, setTotalAmount] = useState(initial?.total_amount ?? 0);
  const [currency, setCurrency] = useState(initial?.currency ?? 'INR');
  
  // Additional Information
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [terms, setTerms] = useState(initial?.terms ?? '');
  const [poNumber, setPoNumber] = useState(initial?.po_number ?? '');
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '');
  
  // Related Entities (now handled by dropdowns)
  
  // Calculate totals when items change
  useEffect(() => {
    let newSubtotal = 0;
    let newTaxAmount = 0;
    let newDiscountAmount = 0;
    
    items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const lineDiscount = (lineSubtotal * (item.discount || 0)) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * (item.tax_rate || 0)) / 100;
      const lineTotal = lineAfterDiscount + lineTax;
      
      newSubtotal += lineSubtotal;
      newDiscountAmount += lineDiscount;
      newTaxAmount += lineTax;
      
      // Update item totals
      item.line_total = lineSubtotal;
      item.tax_amount = lineTax;
      item.total_amount = lineTotal;
    });
    
    setSubtotal(newSubtotal);
    setDiscountAmount(newDiscountAmount);
    setTaxAmount(newTaxAmount);
    setTotalAmount(newSubtotal - newDiscountAmount + newTaxAmount + (shippingAmount || 0));
  }, [items, shippingAmount]);
  
  // Fetch customers, orders, and projects on mount
  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    fetchProjects();
  }, []);
  
  // Sync form when initial changes
  useEffect(() => {
    if (initial) {
      setInvoiceNumber(initial.invoice_number ?? generateInvoiceNumber());
      setInvoiceType(initial.invoice_type ?? 'SALES');
      setStatus(initial.status ?? 'DRAFT');
      setCustomerId(initial.customer_id ?? '');
      setCustomerName(initial.customer_name ?? '');
      setCustomerEmail(initial.customer_email ?? '');
      setCustomerPhone(initial.customer_phone ?? '');
      setCustomerAddress(initial.customer_address ?? '');
      setCustomerCity(initial.customer_city ?? '');
      setCustomerState(initial.customer_state ?? '');
      setCustomerPostalCode(initial.customer_postal_code ?? '');
      setCustomerCountry(initial.customer_country ?? '');
      setCustomerTaxId(initial.customer_tax_id ?? '');
      setSelectedCustomerId(initial.customer_id ?? '');
      
      if (initial.invoice_date) {
        setInvoiceDate(new Date(initial.invoice_date).toISOString().slice(0, 10));
      }
      if (initial.due_date) {
        setDueDate(new Date(initial.due_date).toISOString().slice(0, 10));
      }
      
      if (initial.items && initial.items.length > 0) {
        setItems(initial.items);
      }
      
      setSubtotal(initial.subtotal ?? 0);
      setTaxAmount(initial.tax_amount ?? 0);
      setDiscountAmount(initial.discount_amount ?? 0);
      setShippingAmount(initial.shipping_amount ?? 0);
      setTotalAmount(initial.total_amount ?? 0);
      setCurrency(initial.currency ?? 'INR');
      setNotes(initial.notes ?? '');
      setTerms(initial.terms ?? '');
      setPoNumber(initial.po_number ?? '');
      setReferenceNumber(initial.reference_number ?? '');
      setSelectedOrderId(initial.order_id ?? '');
      setSelectedProjectId(initial.project_id ?? '');
    }
  }, [initial]);
  
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const customerList = await crmApi.listCustomers();
      setCustomers(customerList);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const orderList = await ordersApi.listSalesOrders();
      setOrders(orderList);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };
  
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const projectList = await projectsApi.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };
  
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => String(c.id) === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      setCustomerId(customerId);
      setCustomerName(customer.company_name || customer.name || '');
      setCustomerEmail(customer.email || '');
      setCustomerPhone(customer.phone || '');
      setCustomerAddress(customer.address || '');
      setCustomerCity(customer.city || '');
      setCustomerState(customer.state || '');
      setCustomerPostalCode(customer.postal_code || '');
      setCustomerCountry(customer.country || '');
    }
  };
  
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
        discount: 0,
        line_total: 0,
        tax_amount: 0,
        total_amount: 0,
      },
    ]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const invoiceData: Partial<Invoice> = {
      invoice_number: invoiceNumber,
      invoice_type: invoiceType,
      status,
      customer_id: customerId || undefined,
      customer_name: customerName,
      customer_email: customerEmail || undefined,
      customer_phone: customerPhone || undefined,
      customer_address: customerAddress || undefined,
      customer_city: customerCity || undefined,
      customer_state: customerState || undefined,
      customer_postal_code: customerPostalCode || undefined,
      customer_country: customerCountry || undefined,
      customer_tax_id: customerTaxId || undefined,
      invoice_date: invoiceDate,
      due_date: dueDate,
      items: items.filter((item) => item.item_name.trim() !== ''),
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount || undefined,
      shipping_amount: shippingAmount || undefined,
      total_amount: totalAmount,
      currency,
      notes: notes || undefined,
      terms: terms || undefined,
      po_number: poNumber || undefined,
      reference_number: referenceNumber || undefined,
      order_id: selectedOrderId || undefined,
      project_id: selectedProjectId || undefined,
    };
    
    onSubmit(invoiceData);
  };
  
  const customerOptions = customers.map((customer) => ({
    value: String(customer.id),
    label: customer.company_name || customer.name || customer.email || '',
  }));
  
  const orderOptions = orders.map((order) => ({
    value: String(order.id),
    label: `${order.order_number || order.id} - ${order.customer}${order.total_amount ? ` (${order.currency} ${order.total_amount.toFixed(2)})` : ''}`,
  }));
  
  const projectOptions = projects.map((project) => ({
    value: String(project.id),
    label: `${project.project_code || project.id} - ${project.name}${project.client ? ` (${project.client})` : ''}`,
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Basic Information */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Invoice Number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          required
        />
        <Select
          label="Invoice Type"
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
          required
        >
          <option value="SALES">Sales</option>
          <option value="PURCHASE">Purchase</option>
          <option value="SERVICE">Service</option>
          <option value="PRODUCT">Product</option>
          <option value="RECURRING">Recurring</option>
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
          required
        >
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
      </div>
      
      {/* Customer Selection */}
      <div>
        <SearchableSelect
          label="Customer"
          value={selectedCustomerId}
          onChange={handleCustomerSelect}
          options={customerOptions}
          placeholder="Search and select customer..."
          disabled={customersLoading}
        />
      </div>
      
      {/* Customer Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <Input
          label="Customer Email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
        <Input
          label="Customer Phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
        <Input
          label="Tax ID"
          value={customerTaxId}
          onChange={(e) => setCustomerTaxId(e.target.value)}
        />
        <Textarea
          label="Customer Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          rows={2}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            label="City"
            value={customerCity}
            onChange={(e) => setCustomerCity(e.target.value)}
          />
          <Input
            label="State"
            value={customerState}
            onChange={(e) => setCustomerState(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            label="Postal Code"
            value={customerPostalCode}
            onChange={(e) => setCustomerPostalCode(e.target.value)}
          />
          <Input
            label="Country"
            value={customerCountry}
            onChange={(e) => setCustomerCountry(e.target.value)}
          />
        </div>
      </div>
      
      {/* Invoice Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Invoice Date"
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={invoiceDate}
          required
        />
      </div>
      
      {/* Invoice Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-semibold text-slate-800">Invoice Items</label>
          <Button type="button" variant="ghost" size="xs" onClick={addItem}>
            + Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-12 p-2 border border-slate-200 rounded">
              <div className="sm:col-span-4">
                <Input
                  placeholder="Item name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unit_price || ''}
                  onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  placeholder="Tax %"
                  value={item.tax_rate || ''}
                  onChange={(e) => handleItemChange(index, 'tax_rate', Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="sm:col-span-1">
                <div className="text-[10px] text-slate-600 pt-2">
                  ₹{item.total_amount.toFixed(2)}
                </div>
              </div>
              <div className="sm:col-span-1">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => removeItem(index)}
                    className="text-red-600"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Input
            label="Shipping Amount"
            type="number"
            value={shippingAmount || ''}
            onChange={(e) => setShippingAmount(Number(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-medium">{currency} {subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-600">Discount:</span>
              <span className="font-medium text-red-600">-{currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-600">Tax:</span>
            <span className="font-medium">{currency} {taxAmount.toFixed(2)}</span>
          </div>
          {shippingAmount > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-600">Shipping:</span>
              <span className="font-medium">{currency} {shippingAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] font-semibold border-t border-slate-300 pt-1 mt-1">
            <span>Total:</span>
            <span>{currency} {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="PO Number"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
        />
        <Input
          label="Reference Number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
        />
        <SearchableSelect
          label="Order"
          value={selectedOrderId}
          onChange={setSelectedOrderId}
          options={orderOptions}
          placeholder="Search and select order..."
          disabled={ordersLoading}
        />
        <SearchableSelect
          label="Project"
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          options={projectOptions}
          placeholder="Search and select project..."
          disabled={projectsLoading}
        />
      </div>
      
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      
      <Textarea
        label="Payment Terms"
        value={terms}
        onChange={(e) => setTerms(e.target.value)}
        rows={2}
        placeholder="e.g., Net 30, Due on receipt, etc."
      />
      
      {/* Form Actions */}
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
          {initial ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}

