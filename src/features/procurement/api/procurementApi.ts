import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { PurchaseOrder } from '../types';

let useStatic = !hasSupabaseConfig;

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    po_number: 'PO-2025-001',
    reference_number: 'REQ-2025-001',
    requisition_number: 'PR-2025-001',
    supplier: 'Industrial Suppliers Ltd',
    supplier_id: 'SUP-001',
    supplier_contact_person: 'Robert Chen',
    supplier_email: 'robert.chen@industrialsuppliers.com',
    supplier_phone: '+1-555-0301',
    date: '2025-01-05',
    expected_delivery_date: '2025-01-20',
    status: 'SENT',
    priority: 'HIGH',
    subtotal: 45000,
    tax_amount: 4500,
    shipping_cost: 500,
    discount_amount: 0,
    total_amount: 50000,
    currency: 'USD',
    payment_terms: 'NET_30',
    payment_terms_days: 30,
    advance_payment_required: false,
    delivery_address: '123 Manufacturing St',
    delivery_city: 'Detroit',
    delivery_state: 'MI',
    delivery_postal_code: '48201',
    delivery_country: 'USA',
    delivery_method: 'FREIGHT',
    items_count: 5,
    total_quantity: 500,
    requested_by: 'Production Manager',
    requested_by_id: 'emp-001',
    approved_by: 'Operations Director',
    approved_by_id: 'emp-002',
    approval_date: '2025-01-05',
    department: 'Production',
    project_id: 'PROJ-2025-001',
    cost_center: 'CC-PROD-01',
    description: 'Raw materials for Q1 production',
    notes: 'Steel and aluminum sheets for manufacturing',
    quality_check_required: true,
    received_quantity: 0,
    pending_quantity: 500,
    tags: ['raw-materials', 'production', 'urgent'],
    created_at: '2025-01-04'
  },
  {
    id: 'po-002',
    po_number: 'PO-2025-002',
    reference_number: 'REQ-2025-002',
    supplier: 'Office Supplies Pro',
    supplier_id: 'SUP-002',
    supplier_contact_person: 'Emily Davis',
    supplier_email: 'emily@officesuppliespro.com',
    supplier_phone: '+1-555-0302',
    date: '2025-01-08',
    expected_delivery_date: '2025-01-15',
    status: 'RECEIVED',
    priority: 'LOW',
    subtotal: 1500,
    tax_amount: 150,
    shipping_cost: 50,
    total_amount: 1700,
    currency: 'USD',
    payment_terms: 'NET_15',
    payment_terms_days: 15,
    delivery_address: '456 Office Park Blvd',
    delivery_city: 'Chicago',
    delivery_state: 'IL',
    delivery_postal_code: '60601',
    delivery_country: 'USA',
    delivery_method: 'COURIER',
    tracking_number: 'TRK-123456789',
    items_count: 12,
    total_quantity: 150,
    requested_by: 'Office Manager',
    requested_by_id: 'emp-003',
    approved_by: 'Finance Manager',
    approved_by_id: 'emp-004',
    approval_date: '2025-01-08',
    actual_delivery_date: '2025-01-14',
    department: 'Administration',
    description: 'Office supplies for Q1',
    notes: 'Stationery, printer supplies, and office equipment',
    quality_check_required: false,
    received_quantity: 150,
    pending_quantity: 0,
    tags: ['office-supplies', 'administration'],
    created_at: '2025-01-08'
  },
  {
    id: 'po-003',
    po_number: 'PO-2025-003',
    reference_number: 'REQ-2025-003',
    requisition_number: 'PR-2025-003',
    supplier: 'Tech Equipment Corp',
    supplier_id: 'SUP-003',
    supplier_contact_person: 'Michael Brown',
    supplier_email: 'michael@techequipment.com',
    supplier_phone: '+1-555-0303',
    date: '2025-01-10',
    expected_delivery_date: '2025-02-10',
    status: 'APPROVED',
    priority: 'MEDIUM',
    subtotal: 125000,
    tax_amount: 12500,
    shipping_cost: 2500,
    discount_amount: 5000,
    total_amount: 135000,
    currency: 'USD',
    payment_terms: 'NET_45',
    payment_terms_days: 45,
    advance_payment_required: true,
    advance_payment_amount: 40500,
    advance_payment_percentage: 30,
    delivery_address: '789 Industrial Ave',
    delivery_city: 'Dallas',
    delivery_state: 'TX',
    delivery_postal_code: '75201',
    delivery_country: 'USA',
    delivery_method: 'FREIGHT',
    items_count: 8,
    total_quantity: 25,
    requested_by: 'IT Manager',
    requested_by_id: 'emp-005',
    approved_by: 'CFO',
    approved_by_id: 'emp-006',
    approval_date: '2025-01-10',
    department: 'IT',
    project_id: 'PROJ-2025-002',
    cost_center: 'CC-IT-01',
    description: 'Manufacturing equipment and machinery',
    notes: 'CNC machines and industrial equipment for new production line',
    quality_check_required: true,
    received_quantity: 0,
    pending_quantity: 25,
    tags: ['equipment', 'machinery', 'capital-expenditure'],
    created_at: '2025-01-10'
  },
  {
    id: 'po-004',
    po_number: 'PO-2025-004',
    supplier: 'Chemical Supplies Inc',
    supplier_id: 'SUP-004',
    supplier_contact_person: 'Lisa Wang',
    supplier_email: 'lisa@chemicalsupplies.com',
    date: '2025-01-12',
    expected_delivery_date: '2025-01-22',
    status: 'PENDING_APPROVAL',
    priority: 'HIGH',
    subtotal: 28000,
    tax_amount: 2800,
    shipping_cost: 1200,
    total_amount: 32000,
    currency: 'USD',
    payment_terms: 'NET_30',
    payment_terms_days: 30,
    delivery_address: '123 Manufacturing St',
    delivery_city: 'Detroit',
    delivery_state: 'MI',
    delivery_postal_code: '48201',
    delivery_country: 'USA',
    delivery_method: 'FREIGHT',
    items_count: 15,
    total_quantity: 1000,
    requested_by: 'Production Supervisor',
    requested_by_id: 'emp-007',
    department: 'Production',
    cost_center: 'CC-PROD-01',
    description: 'Industrial chemicals for manufacturing process',
    notes: 'Pending approval from Operations Director',
    quality_check_required: true,
    received_quantity: 0,
    pending_quantity: 1000,
    tags: ['chemicals', 'production', 'hazmat'],
    created_at: '2025-01-12'
  },
  {
    id: 'po-005',
    po_number: 'PO-2025-005',
    reference_number: 'REQ-2025-005',
    supplier: 'Packaging Solutions Ltd',
    supplier_id: 'SUP-005',
    supplier_contact_person: 'David Kim',
    supplier_email: 'david@packagingsolutions.com',
    date: '2025-01-15',
    expected_delivery_date: '2025-01-25',
    actual_delivery_date: '2025-01-23',
    status: 'PARTIALLY_RECEIVED',
    priority: 'MEDIUM',
    subtotal: 15000,
    tax_amount: 1500,
    shipping_cost: 300,
    total_amount: 16800,
    currency: 'USD',
    payment_terms: 'NET_30',
    payment_terms_days: 30,
    delivery_address: '456 Warehouse Rd',
    delivery_city: 'Chicago',
    delivery_state: 'IL',
    delivery_postal_code: '60601',
    delivery_country: 'USA',
    delivery_method: 'STANDARD',
    tracking_number: 'TRK-987654321',
    items_count: 10,
    total_quantity: 5000,
    requested_by: 'Warehouse Manager',
    requested_by_id: 'emp-008',
    approved_by: 'Operations Manager',
    approved_by_id: 'emp-009',
    approval_date: '2025-01-15',
    department: 'Warehouse',
    description: 'Packaging materials for finished goods',
    notes: 'Boxes, labels, and protective materials',
    quality_check_required: false,
    received_quantity: 3000,
    pending_quantity: 2000,
    inspected_by: 'QC Team',
    inspection_date: '2025-01-23',
    quality_check_passed: true,
    tags: ['packaging', 'warehouse', 'materials'],
    created_at: '2025-01-15'
  }
];

function nextId() {
  return `po-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (useStatic) return mockPurchaseOrders;

  try {
    const { data, error } = await supabase.from('purchase_orders').select('*');
    if (error) throw error;
    return (data as PurchaseOrder[]) ?? [];
  } catch (error) {
    handleApiError('procurement.listPurchaseOrders', error);
    useStatic = true;
    return mockPurchaseOrders;
  }
}

export async function createPurchaseOrder(
  payload: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<PurchaseOrder> {
  if (useStatic) {
    const po: PurchaseOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockPurchaseOrders.unshift(po);
    return po;
  }

  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  } catch (error) {
    handleApiError('procurement.createPurchaseOrder', error);
    useStatic = true;
    return createPurchaseOrder(payload);
  }
}

export async function updatePurchaseOrder(
  id: string,
  changes: Partial<PurchaseOrder>
): Promise<PurchaseOrder | null> {
  if (useStatic) {
    const index = mockPurchaseOrders.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockPurchaseOrders[index] = { ...mockPurchaseOrders[index], ...changes };
    return mockPurchaseOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  } catch (error) {
    handleApiError('procurement.updatePurchaseOrder', error);
    useStatic = true;
    return updatePurchaseOrder(id, changes);
  }
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockPurchaseOrders.findIndex((p) => p.id === id);
    if (index !== -1) mockPurchaseOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('procurement.deletePurchaseOrder', error);
    useStatic = true;
    await deletePurchaseOrder(id);
  }
}

