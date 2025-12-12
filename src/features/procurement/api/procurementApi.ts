import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { PurchaseOrder } from '../types';

let useStatic = !hasSupabaseConfig;

// Backend API flag - set to true to use backend API
const USE_BACKEND_API = true;

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
    currency: 'INR',
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
    currency: 'INR',
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
    currency: 'INR',
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
    currency: 'INR',
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
    currency: 'INR',
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

// Map backend purchase order to frontend format
function mapBackendPurchaseOrder(backendPO: any): PurchaseOrder {
  const poId = backendPO.id?.toString() || backendPO.po_id?.toString();
  
  console.log('Mapping purchase order:', {
    backend_id: backendPO.id,
    backend_po_id: backendPO.po_id,
    mapped_id: poId,
    po_number: backendPO.po_number
  });
  
  return {
    id: poId,
    po_number: backendPO.po_number || '',
    reference_number: backendPO.reference_number,
    requisition_number: backendPO.requisition_number,
    
    // Supplier Information
    supplier: backendPO.supplier_name || backendPO.supplier || '',
    supplier_id: backendPO.supplier_id?.toString(),
    supplier_contact_person: backendPO.supplier_contact_person,
    supplier_email: backendPO.supplier_email,
    supplier_phone: backendPO.supplier_phone,
    
    // Dates
    date: backendPO.po_date || backendPO.order_date || backendPO.date 
      ? new Date(backendPO.po_date || backendPO.order_date || backendPO.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    expected_delivery_date: backendPO.expected_delivery_date 
      ? new Date(backendPO.expected_delivery_date).toISOString().split('T')[0] 
      : undefined,
    actual_delivery_date: backendPO.actual_delivery_date 
      ? new Date(backendPO.actual_delivery_date).toISOString().split('T')[0] 
      : undefined,
    due_date: backendPO.due_date 
      ? new Date(backendPO.due_date).toISOString().split('T')[0] 
      : undefined,
    
    // Status & Priority
    status: (backendPO.status?.toUpperCase() || 'DRAFT') as any,
    priority: (backendPO.priority?.toUpperCase() || 'MEDIUM') as any,
    
    // Financial Details
    subtotal: parseFloat(backendPO.subtotal) || 0,
    tax_amount: parseFloat(backendPO.tax_amount) || 0,
    shipping_cost: parseFloat(backendPO.shipping_cost) || 0,
    discount_amount: parseFloat(backendPO.discount_amount) || 0,
    total_amount: parseFloat(backendPO.total_amount) || parseFloat(backendPO.subtotal) || 0,
    currency: (backendPO.currency || 'INR') as any,
    exchange_rate: parseFloat(backendPO.exchange_rate) || undefined,
    
    // Payment Information
    payment_terms: (backendPO.payment_terms || 'NET_30') as any,
    payment_terms_days: parseInt(backendPO.payment_terms_days) || undefined,
    advance_payment_required: backendPO.advance_payment_required || false,
    advance_payment_amount: parseFloat(backendPO.advance_payment_amount) || undefined,
    advance_payment_percentage: parseFloat(backendPO.advance_payment_percentage) || undefined,
    
    // Delivery Information
    delivery_address: backendPO.delivery_address,
    delivery_city: backendPO.delivery_city,
    delivery_state: backendPO.delivery_state,
    delivery_postal_code: backendPO.delivery_postal_code,
    delivery_country: backendPO.delivery_country,
    delivery_method: backendPO.delivery_method as any,
    tracking_number: backendPO.tracking_number,
    
    // Items Information
    items_count: parseInt(backendPO.items_count) || 0,
    total_quantity: parseInt(backendPO.total_quantity) || 0,
    
    // Approval & Workflow
    requested_by: backendPO.requested_by_name || backendPO.requested_by,
    requested_by_id: backendPO.requested_by_id?.toString() || backendPO.created_by?.toString(),
    approved_by: backendPO.approved_by_name || backendPO.approved_by,
    approved_by_id: backendPO.approved_by_id?.toString(),
    approval_date: backendPO.approval_date || backendPO.approved_date,
    
    // Department & Project
    department: backendPO.department,
    project_id: backendPO.project_id?.toString(),
    cost_center: backendPO.cost_center,
    
    // Additional Details
    description: backendPO.description,
    notes: backendPO.notes,
    internal_notes: backendPO.internal_notes,
    terms_and_conditions: backendPO.terms_and_conditions,
    
    // Receiving Information
    received_quantity: parseInt(backendPO.received_quantity) || 0,
    pending_quantity: parseInt(backendPO.pending_quantity) || 0,
    quality_check_required: backendPO.quality_check_required || false,
    quality_check_passed: backendPO.quality_check_passed,
    inspected_by: backendPO.inspected_by,
    inspection_date: backendPO.inspection_date,
    
    // Attachments & Tags
    attachments: backendPO.attachments || [],
    tags: backendPO.tags || [],
    
    created_at: backendPO.created_at,
  };
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching purchase orders from backend API...');
      const response = await apiRequest<{ success: boolean; data: { purchase_orders: any[] } } | { purchase_orders: any[] }>(
        '/procurement/purchase-orders?page=1&limit=100'
      );
      
      console.log('📦 Backend purchase orders response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
      
      // Handle different response formats
      let purchaseOrders = [];
      
      if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response) {
          console.log('📦 Response has success and data');
          console.log('📦 Response.data keys:', Object.keys(response.data || {}));
          if (response.data.purchase_orders && Array.isArray(response.data.purchase_orders)) {
            purchaseOrders = response.data.purchase_orders;
            console.log('📦 Found purchase_orders in response.data:', purchaseOrders.length);
            console.log('📦 First PO before mapping:', purchaseOrders[0]);
          } else if (Array.isArray(response.data)) {
            purchaseOrders = response.data;
            console.log('📦 Response.data is array:', purchaseOrders.length);
          }
        }
        // If direct purchase_orders array
        else if ('purchase_orders' in response && Array.isArray(response.purchase_orders)) {
          purchaseOrders = response.purchase_orders;
          console.log('📦 Found purchase_orders in response root:', purchaseOrders.length);
        }
        // If direct array
        else if (Array.isArray(response)) {
          purchaseOrders = response;
          console.log('📦 Response is direct array:', purchaseOrders.length);
        }
      }
      
      console.log('📦 Extracted purchaseOrders:', purchaseOrders.length, 'items');
      console.log('📦 purchaseOrders sample:', purchaseOrders.slice(0, 2));
      
      if (purchaseOrders.length > 0) {
        console.log('📦 About to map purchase orders...');
        const mapped = purchaseOrders.map(mapBackendPurchaseOrder);
        console.log('✅ Mapped purchase orders:', mapped.length);
        console.log('✅ First mapped PO:', mapped[0]);
        return mapped;
      }
      
      console.log('⚠️ No purchase orders found in response');
      
      console.log('⚠️ No purchase orders in response, using mock data');
      return mockPurchaseOrders;
    } catch (error) {
      console.error('❌ Backend API error, falling back to mock data:', error);
      return mockPurchaseOrders;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating purchase order via backend API...');
      
      // Map frontend payload to backend format
      const backendPayload = {
        po_number: payload.po_number,
        reference_number: payload.reference_number,
        requisition_number: payload.requisition_number,
        supplier_id: payload.supplier_id ? parseInt(payload.supplier_id) : undefined,
        supplier_name: payload.supplier,
        supplier_contact_person: payload.supplier_contact_person,
        supplier_email: payload.supplier_email,
        supplier_phone: payload.supplier_phone,
        po_date: payload.date,
        expected_delivery_date: payload.expected_delivery_date,
        status: payload.status,
        priority: payload.priority,
        subtotal: payload.subtotal,
        tax_amount: payload.tax_amount,
        shipping_cost: payload.shipping_cost,
        discount_amount: payload.discount_amount,
        total_amount: payload.total_amount,
        currency: payload.currency,
        payment_terms: payload.payment_terms,
        payment_terms_days: payload.payment_terms_days,
        advance_payment_required: payload.advance_payment_required,
        advance_payment_amount: payload.advance_payment_amount,
        delivery_address: payload.delivery_address,
        delivery_city: payload.delivery_city,
        delivery_state: payload.delivery_state,
        delivery_postal_code: payload.delivery_postal_code,
        delivery_country: payload.delivery_country,
        delivery_method: payload.delivery_method,
        department: payload.department,
        description: payload.description,
        notes: payload.notes,
        quality_check_required: payload.quality_check_required,
      };
      
      console.log('📤 Backend payload:', backendPayload);
      
      const response = await apiRequest<{ success: boolean; data: any }>(
        '/procurement/purchase-orders',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('✅ Created purchase order response:', response);
      
      if (response.success && response.data) {
        return mapBackendPurchaseOrder(response.data);
      }
      
      throw new Error('Failed to create purchase order');
    } catch (error) {
      console.error('❌ Error creating purchase order:', error);
      handleApiError('procurement.createPurchaseOrder', error);
      throw error;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating purchase order via backend API:', id);
      
      // Map frontend changes to backend format
      const backendChanges: any = {};
      if (changes.po_number) backendChanges.po_number = changes.po_number;
      if (changes.reference_number) backendChanges.reference_number = changes.reference_number;
      if (changes.supplier) backendChanges.supplier_name = changes.supplier;
      if (changes.supplier_id) backendChanges.supplier_id = parseInt(changes.supplier_id);
      if (changes.supplier_contact_person) backendChanges.supplier_contact_person = changes.supplier_contact_person;
      if (changes.supplier_email) backendChanges.supplier_email = changes.supplier_email;
      if (changes.date) backendChanges.po_date = changes.date;
      if (changes.expected_delivery_date) backendChanges.expected_delivery_date = changes.expected_delivery_date;
      if (changes.status) backendChanges.status = changes.status;
      if (changes.priority) backendChanges.priority = changes.priority;
      if (changes.subtotal !== undefined) backendChanges.subtotal = changes.subtotal;
      if (changes.tax_amount !== undefined) backendChanges.tax_amount = changes.tax_amount;
      if (changes.shipping_cost !== undefined) backendChanges.shipping_cost = changes.shipping_cost;
      if (changes.total_amount !== undefined) backendChanges.total_amount = changes.total_amount;
      if (changes.currency) backendChanges.currency = changes.currency;
      if (changes.payment_terms) backendChanges.payment_terms = changes.payment_terms;
      if (changes.delivery_address) backendChanges.delivery_address = changes.delivery_address;
      if (changes.description) backendChanges.description = changes.description;
      if (changes.notes) backendChanges.notes = changes.notes;
      
      console.log('📤 Update payload:', backendChanges);
      
      const response = await apiRequest<{ success: boolean; data: any }>(
        `/procurement/purchase-orders/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendChanges),
        }
      );
      
      console.log('✅ Updated purchase order response:', response);
      
      if (response.success && response.data) {
        return mapBackendPurchaseOrder(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error updating purchase order:', error);
      handleApiError('procurement.updatePurchaseOrder', error);
      return null;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting purchase order via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/procurement/purchase-orders/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('✅ Deleted purchase order response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete purchase order');
      }
    } catch (error) {
      console.error('❌ Error deleting purchase order:', error);
      handleApiError('procurement.deletePurchaseOrder', error);
      throw error;
    }
    return;
  }
  
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

