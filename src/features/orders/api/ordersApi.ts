import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { SalesOrder } from '../types';

let useStatic = !hasSupabaseConfig;

// Backend API flag - set to true to use backend API
const USE_BACKEND_API = true;

const mockOrders: SalesOrder[] = [
  {
    id: 'so-1',
    order_number: 'SO-2025-ABC123',
    customer: 'Acme Retail Co.',
    customer_phone: '+1 (555) 123-4567',
    customer_email: 'contact@acmeretail.com',
    contact_person: 'John Smith',
    date: '2025-01-03',
    expected_delivery_date: '2025-01-10',
    status: 'CONFIRMED',
    payment_status: 'UNPAID',
    priority: 'HIGH',
    shipping_address: '123 Main Street',
    shipping_city: 'New York',
    shipping_state: 'NY',
    shipping_postal_code: '10001',
    shipping_country: 'USA',
    subtotal: 17000,
    tax_amount: 1360,
    shipping_cost: 90,
    discount_amount: 0,
    total_amount: 18450,
    currency: 'USD',
    payment_terms: 'NET_30',
    payment_due_date: '2025-02-02',
    shipping_method: 'EXPRESS',
    warehouse_location: 'WH-01',
    sales_representative: 'Sarah Johnson',
    order_source: 'ONLINE',
    notes: 'Customer requested express shipping',
    created_at: '2025-01-03'
  },
  {
    id: 'so-2',
    order_number: 'SO-2025-XYZ789',
    customer: 'Global Logistics Ltd.',
    customer_phone: '+1 (555) 987-6543',
    customer_email: 'orders@globallogistics.com',
    contact_person: 'Jane Doe',
    date: '2025-01-06',
    expected_delivery_date: '2025-01-15',
    status: 'PENDING',
    payment_status: 'UNPAID',
    priority: 'MEDIUM',
    shipping_address: '456 Business Park',
    shipping_city: 'Los Angeles',
    shipping_state: 'CA',
    shipping_postal_code: '90001',
    shipping_country: 'USA',
    subtotal: 6500,
    tax_amount: 520,
    shipping_cost: 180,
    discount_amount: 0,
    total_amount: 7200,
    currency: 'USD',
    payment_terms: 'NET_15',
    payment_due_date: '2025-01-21',
    shipping_method: 'STANDARD',
    warehouse_location: 'WH-02',
    sales_representative: 'Mike Wilson',
    order_source: 'PHONE',
    customer_po_number: 'PO-2025-001',
    notes: 'Large order - requires special handling',
    created_at: '2025-01-06'
  }
];

function nextId() {
  return `so-${Math.random().toString(36).slice(2, 8)}`;
}

// Customer cache for lookup
let customerCache: Map<string, string> = new Map();
let customersLoaded = false;

// Load customers for name lookup
async function loadCustomersForLookup(forceRefresh = false): Promise<void> {
  if (customersLoaded && !forceRefresh) return;
  
  try {
    console.log('🔄 Loading customers for name lookup...');
    const response = await apiRequest<{ success: boolean; data: { customers: any[] } } | { customers: any[] } | any[]>(
      '/customers?page=1&limit=1000'
    );
    
    let customers = null;
    if (response && typeof response === 'object') {
      if ('success' in response && response.success && 'data' in response && response.data.customers) {
        customers = response.data.customers;
      } else if ('customers' in response) {
        customers = response.customers;
      } else if (Array.isArray(response)) {
        customers = response;
      }
    }
    
    if (customers && Array.isArray(customers)) {
      // Clear cache if forcing refresh
      if (forceRefresh) {
        customerCache.clear();
      }
      
      customers.forEach((customer: any) => {
        const customerId = customer.id?.toString() || customer.customer_id?.toString();
        const customerName = customer.name || customer.customer_name || customer.company_name;
        if (customerId && customerName) {
          customerCache.set(customerId, customerName);
        }
      });
      console.log('✅ Loaded', customerCache.size, 'customers for lookup');
      customersLoaded = true;
    }
  } catch (error) {
    console.warn('⚠️ Could not load customers for lookup:', error);
    // Don't throw - we'll just show customer ID if lookup fails
  }
}

// Map backend order response to frontend format
function mapBackendOrder(backendOrder: any): SalesOrder {
  const orderId = backendOrder.id?.toString() || backendOrder.order_id?.toString() || backendOrder.sales_order_id?.toString();
  
  // Handle customer - try multiple sources for customer name
  // Check for customer info that might come from a JOIN in the backend
  let customerName = backendOrder.customer || 
                    backendOrder.customer_name || 
                    backendOrder.company_name ||
                    backendOrder.customer_company_name ||
                    backendOrder.name; // Sometimes joined customer data has 'name' field
  
  // If no customer name but we have customer_id, try to get from cache
  if (!customerName && backendOrder.customer_id) {
    const customerId = backendOrder.customer_id.toString();
    customerName = customerCache.get(customerId);
    if (!customerName) {
      // If not in cache, show customer ID (will be updated when cache loads)
      customerName = `Customer ID: ${customerId}`;
    }
  }
  
  // Fallback if still no name
  if (!customerName) {
    customerName = backendOrder.customer_id ? `Customer ID: ${backendOrder.customer_id}` : 'N/A';
  }
  
  // Handle date conversions
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return undefined;
    }
  };
  
  return {
    id: orderId,
    order_number: backendOrder.order_number || backendOrder.so_number || backendOrder.order_no,
    customer: customerName,
    customer_phone: backendOrder.customer_phone || backendOrder.phone || undefined,
    customer_email: backendOrder.customer_email || backendOrder.email || undefined,
    contact_person: backendOrder.contact_person || backendOrder.contact_name || undefined,
    date: formatDate(backendOrder.order_date) || formatDate(backendOrder.date) || new Date().toISOString().split('T')[0],
    expected_delivery_date: formatDate(backendOrder.expected_delivery_date) || formatDate(backendOrder.delivery_date) || undefined,
    shipped_date: formatDate(backendOrder.shipped_date) || undefined,
    delivered_date: formatDate(backendOrder.actual_delivery_date) || formatDate(backendOrder.delivered_date) || undefined,
    status: (backendOrder.status?.toUpperCase() || 'PENDING') as any,
    payment_status: (backendOrder.payment_status?.toUpperCase() || 'UNPAID') as any,
    priority: (backendOrder.priority?.toUpperCase() || 'MEDIUM') as any,
    shipping_address: backendOrder.shipping_address || backendOrder.ship_address || undefined,
    billing_address: backendOrder.billing_address || backendOrder.bill_address || undefined,
    shipping_city: backendOrder.shipping_city || backendOrder.ship_city || undefined,
    shipping_state: backendOrder.shipping_state || backendOrder.ship_state || undefined,
    shipping_postal_code: backendOrder.shipping_postal_code || backendOrder.ship_postal_code || backendOrder.ship_zip || undefined,
    shipping_country: backendOrder.shipping_country || backendOrder.ship_country || undefined,
    subtotal: parseFloat(backendOrder.subtotal) || 0,
    tax_amount: parseFloat(backendOrder.tax_amount) || 0,
    shipping_cost: parseFloat(backendOrder.shipping_cost) || 0,
    discount_amount: parseFloat(backendOrder.discount_amount) || 0,
    total_amount: parseFloat(backendOrder.total_amount) || parseFloat(backendOrder.total) || 0,
    currency: backendOrder.currency || 'INR',
    payment_terms: (backendOrder.payment_terms?.toUpperCase() || 'NET_30') as any,
    payment_due_date: formatDate(backendOrder.payment_due_date) || undefined,
    invoice_number: backendOrder.invoice_number || backendOrder.invoice_no || undefined,
    customer_po_number: backendOrder.customer_po_number || backendOrder.po_number || undefined,
    shipping_method: (backendOrder.shipping_method?.toUpperCase() || 'STANDARD') as any,
    tracking_number: backendOrder.tracking_number || backendOrder.tracking_no || undefined,
    warehouse_location: backendOrder.warehouse_location || backendOrder.warehouse || undefined,
    sales_representative: backendOrder.sales_representative || backendOrder.sales_rep || backendOrder.rep_name || undefined,
    assigned_to: backendOrder.assigned_to || backendOrder.assigned_user || undefined,
    order_source: (backendOrder.order_source?.toUpperCase() || 'ONLINE') as any,
    notes: backendOrder.notes || backendOrder.description || undefined,
    internal_notes: backendOrder.internal_notes || backendOrder.internal_remarks || undefined,
    tags: Array.isArray(backendOrder.tags) ? backendOrder.tags : [],
    created_at: backendOrder.created_at || backendOrder.createdAt,
  };
}

export async function listSalesOrders(): Promise<SalesOrder[]> {
  if (USE_BACKEND_API) {
    try {
      // Load customers first for name lookup
      await loadCustomersForLookup();
      
      console.log('🔄 Fetching sales orders from backend API...');
      const response = await apiRequest<{ success: boolean; data: { sales_orders: any[] } } | { sales_orders: any[] } | { orders: any[] } | any[]>(
        '/orders?page=1&limit=100'
      );
      
      console.log('📦 Backend orders response:', response);
      
      // Handle different response formats
      let orders = null;
      
      if (response && typeof response === 'object') {
        // If wrapped in success/data with sales_orders
        if ('success' in response && response.success && 'data' in response) {
          if (response.data.sales_orders) {
            orders = response.data.sales_orders;
          } else if (response.data.orders) {
            orders = response.data.orders;
          }
        }
        // If direct sales_orders array
        else if ('sales_orders' in response) {
          orders = response.sales_orders;
        }
        // If direct orders array
        else if ('orders' in response) {
          orders = response.orders;
        }
        // If direct array
        else if (Array.isArray(response)) {
          orders = response;
        }
      }
      
      if (orders && Array.isArray(orders) && orders.length > 0) {
        const mapped = orders.map(mapBackendOrder);
        console.log('✅ Mapped orders:', mapped.length);
        return mapped;
      }
      
      console.log('⚠️ No orders in response, using mock data');
      return mockOrders;
    } catch (error) {
      console.error('❌ Backend API error, falling back to mock data:', error);
      return mockOrders;
    }
  }
  
  if (useStatic) return mockOrders;

  try {
    const { data, error } = await supabase.from('sales_orders').select('*');
    if (error) throw error;
    return (data as SalesOrder[]) ?? [];
  } catch (error) {
    handleApiError('orders.listSalesOrders', error);
    useStatic = true;
    return mockOrders;
  }
}

export async function createSalesOrder(
  payload: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<SalesOrder> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating sales order via backend API...');
      
      // Map frontend payload to backend format
      const backendPayload: any = {
        order_number: payload.order_number,
        customer: payload.customer,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email,
        contact_person: payload.contact_person,
        order_date: payload.date,
        expected_delivery_date: payload.expected_delivery_date,
        status: payload.status,
        payment_status: payload.payment_status,
        priority: payload.priority,
        shipping_address: payload.shipping_address,
        billing_address: payload.billing_address,
        shipping_city: payload.shipping_city,
        shipping_state: payload.shipping_state,
        shipping_postal_code: payload.shipping_postal_code,
        shipping_country: payload.shipping_country,
        subtotal: payload.subtotal,
        tax_amount: payload.tax_amount,
        shipping_cost: payload.shipping_cost,
        discount_amount: payload.discount_amount,
        total_amount: payload.total_amount,
        currency: payload.currency,
        payment_terms: payload.payment_terms,
        payment_due_date: payload.payment_due_date,
        invoice_number: payload.invoice_number,
        customer_po_number: payload.customer_po_number,
        shipping_method: payload.shipping_method,
        tracking_number: payload.tracking_number,
        warehouse_location: payload.warehouse_location,
        sales_representative: payload.sales_representative,
        assigned_to: payload.assigned_to,
        order_source: payload.order_source,
        notes: payload.notes,
        internal_notes: payload.internal_notes,
      };
      
      // Remove undefined values
      Object.keys(backendPayload).forEach(key => {
        if (backendPayload[key] === undefined) {
          delete backendPayload[key];
        }
      });
      
      const response = await apiRequest<{ success: boolean; data: any } | any>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('✅ Created order response:', response);
      
      // Handle different response formats
      let orderData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response) {
          orderData = response.data;
        } else if ('id' in response || 'order_number' in response) {
          orderData = response;
        }
      }
      
      if (orderData) {
        const mapped = mapBackendOrder(orderData);
        console.log('✅ Mapped created order');
        return mapped;
      }
      
      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Error creating order:', error);
      handleApiError('orders.createSalesOrder', error);
      throw error;
    }
  }
  
  if (useStatic) {
    const order: SalesOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockOrders.unshift(order);
    return order;
  }

  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SalesOrder;
  } catch (error) {
    handleApiError('orders.createSalesOrder', error);
    useStatic = true;
    return createSalesOrder(payload);
  }
}

export async function updateSalesOrder(
  id: string,
  changes: Partial<SalesOrder>
): Promise<SalesOrder | null> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating sales order via backend API:', id);
      
      // Map frontend changes to backend format
      const backendPayload: any = {};
      if (changes.order_number !== undefined) backendPayload.order_number = changes.order_number;
      if (changes.customer !== undefined) backendPayload.customer = changes.customer;
      if (changes.customer_phone !== undefined) backendPayload.customer_phone = changes.customer_phone;
      if (changes.customer_email !== undefined) backendPayload.customer_email = changes.customer_email;
      if (changes.contact_person !== undefined) backendPayload.contact_person = changes.contact_person;
      if (changes.date !== undefined) backendPayload.order_date = changes.date;
      if (changes.expected_delivery_date !== undefined) backendPayload.expected_delivery_date = changes.expected_delivery_date;
      if (changes.status !== undefined) backendPayload.status = changes.status;
      if (changes.payment_status !== undefined) backendPayload.payment_status = changes.payment_status;
      if (changes.priority !== undefined) backendPayload.priority = changes.priority;
      if (changes.shipping_address !== undefined) backendPayload.shipping_address = changes.shipping_address;
      if (changes.billing_address !== undefined) backendPayload.billing_address = changes.billing_address;
      if (changes.shipping_city !== undefined) backendPayload.shipping_city = changes.shipping_city;
      if (changes.shipping_state !== undefined) backendPayload.shipping_state = changes.shipping_state;
      if (changes.shipping_postal_code !== undefined) backendPayload.shipping_postal_code = changes.shipping_postal_code;
      if (changes.shipping_country !== undefined) backendPayload.shipping_country = changes.shipping_country;
      if (changes.subtotal !== undefined) backendPayload.subtotal = changes.subtotal;
      if (changes.tax_amount !== undefined) backendPayload.tax_amount = changes.tax_amount;
      if (changes.shipping_cost !== undefined) backendPayload.shipping_cost = changes.shipping_cost;
      if (changes.discount_amount !== undefined) backendPayload.discount_amount = changes.discount_amount;
      if (changes.total_amount !== undefined) backendPayload.total_amount = changes.total_amount;
      if (changes.currency !== undefined) backendPayload.currency = changes.currency;
      if (changes.payment_terms !== undefined) backendPayload.payment_terms = changes.payment_terms;
      if (changes.payment_due_date !== undefined) backendPayload.payment_due_date = changes.payment_due_date;
      if (changes.invoice_number !== undefined) backendPayload.invoice_number = changes.invoice_number;
      if (changes.customer_po_number !== undefined) backendPayload.customer_po_number = changes.customer_po_number;
      if (changes.shipping_method !== undefined) backendPayload.shipping_method = changes.shipping_method;
      if (changes.tracking_number !== undefined) backendPayload.tracking_number = changes.tracking_number;
      if (changes.warehouse_location !== undefined) backendPayload.warehouse_location = changes.warehouse_location;
      if (changes.sales_representative !== undefined) backendPayload.sales_representative = changes.sales_representative;
      if (changes.assigned_to !== undefined) backendPayload.assigned_to = changes.assigned_to;
      if (changes.order_source !== undefined) backendPayload.order_source = changes.order_source;
      if (changes.notes !== undefined) backendPayload.notes = changes.notes;
      if (changes.internal_notes !== undefined) backendPayload.internal_notes = changes.internal_notes;
      
      const response = await apiRequest<{ success: boolean; data: any } | any>(
        `/orders/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('✅ Updated order response:', response);
      
      // Handle different response formats
      let orderData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response) {
          orderData = response.data;
        } else if ('id' in response || 'order_number' in response) {
          orderData = response;
        }
      }
      
      if (orderData) {
        const mapped = mapBackendOrder(orderData);
        console.log('✅ Mapped updated order');
        return mapped;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error updating order:', error);
      handleApiError('orders.updateSalesOrder', error);
      return null;
    }
  }
  
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    mockOrders[index] = { ...mockOrders[index], ...changes };
    return mockOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('sales_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as SalesOrder;
  } catch (error) {
    handleApiError('orders.updateSalesOrder', error);
    useStatic = true;
    return updateSalesOrder(id, changes);
  }
}

export async function deleteSalesOrder(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting sales order via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/orders/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('✅ Deleted order response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      handleApiError('orders.deleteSalesOrder', error);
      throw error;
    }
    return;
  }
  
  if (useStatic) {
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index !== -1) mockOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('sales_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('orders.deleteSalesOrder', error);
    useStatic = true;
    await deleteSalesOrder(id);
  }
}


