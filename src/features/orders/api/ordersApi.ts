import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { SalesOrder } from '../types';

let useStatic = !hasSupabaseConfig;

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

export async function listSalesOrders(): Promise<SalesOrder[]> {
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


