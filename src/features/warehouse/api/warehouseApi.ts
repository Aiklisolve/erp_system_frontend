import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { StockMovement, Warehouse } from '../types';

let useStatic = !hasSupabaseConfig;

// Backend API flag - set to true to use backend API
const USE_BACKEND_API = true;

const mockMovements: StockMovement[] = [
  {
    id: 'mv-1',
    movement_number: 'MV-2025-ABC123',
    item_id: 'SKU-2005',
    item_name: 'Barcode Scanner',
    item_sku: 'SKU-2005',
    movement_type: 'TRANSFER',
    status: 'COMPLETED',
    movement_date: '2025-01-04',
    completed_date: '2025-01-04',
    from_location: 'WH-01-A',
    from_zone: 'STORAGE',
    from_bin: 'BIN-01',
    to_location: 'WH-01-B',
    to_zone: 'PICKING',
    to_bin: 'BIN-02',
    quantity: 10,
    unit: 'pcs',
    available_quantity: 50,
    received_quantity: 10,
    reference_number: 'TRF-001',
    reference_type: 'TRANSFER_ORDER',
    assigned_to: 'John Doe',
    operator_name: 'John Doe',
    quality_check_required: true,
    quality_check_passed: true,
    inspected_by: 'Jane Smith',
    unit_cost: 25.50,
    total_cost: 255.00,
    currency: 'INR',
    reason: 'Restocking picking area',
    notes: 'Standard transfer',
    created_at: '2025-01-04'
  },
  {
    id: 'mv-2',
    movement_number: 'MV-2025-XYZ789',
    item_id: 'SKU-1001',
    item_name: 'Cloud Subscription Seat',
    item_sku: 'SKU-1001',
    movement_type: 'RECEIPT',
    status: 'COMPLETED',
    movement_date: '2025-01-07',
    completed_date: '2025-01-07',
    from_location: 'Supplier',
    to_location: 'Main DC',
    to_zone: 'RECEIVING',
    quantity: 40,
    unit: 'licenses',
    received_quantity: 40,
    reference_number: 'PO-2025-001',
    reference_type: 'PURCHASE_ORDER',
    batch_number: 'BATCH-001',
    carrier: 'FedEx',
    tracking_number: 'TRK123456789',
    expected_arrival_date: '2025-01-07',
    actual_arrival_date: '2025-01-07',
    assigned_to: 'Mike Wilson',
    operator_name: 'Mike Wilson',
    quality_check_required: true,
    quality_check_passed: true,
    unit_cost: 100.00,
    total_cost: 4000.00,
    currency: 'INR',
    reason: 'New inventory receipt',
    notes: 'Received from supplier',
    created_at: '2025-01-07'
  },
  {
    id: 'mv-3',
    movement_number: 'MV-2025-DEF456',
    item_id: 'SKU-3001',
    item_name: 'Wireless Mouse',
    item_sku: 'SKU-3001',
    movement_type: 'SHIPMENT',
    status: 'IN_PROGRESS',
    movement_date: '2025-01-08',
    from_location: 'Main DC',
    from_zone: 'PACKING',
    to_location: 'Customer',
    quantity: 25,
    unit: 'pcs',
    reference_number: 'SO-2025-001',
    reference_type: 'SALES_ORDER',
    carrier: 'UPS',
    tracking_number: 'UPS987654321',
    expected_arrival_date: '2025-01-12',
    assigned_to: 'Sarah Johnson',
    operator_name: 'Sarah Johnson',
    unit_cost: 15.00,
    total_cost: 375.00,
    currency: 'INR',
    reason: 'Customer order fulfillment',
    notes: 'Express shipping',
    created_at: '2025-01-08'
  },
  {
    id: 'mv-4',
    movement_number: 'MV-2025-GHI789',
    item_id: 'SKU-2005',
    item_name: 'Barcode Scanner',
    item_sku: 'SKU-2005',
    movement_type: 'ADJUSTMENT',
    status: 'PENDING',
    movement_date: '2025-01-09',
    from_location: 'WH-01-A',
    from_zone: 'STORAGE',
    to_location: 'WH-01-A',
    to_zone: 'STORAGE',
    quantity: -2,
    unit: 'pcs',
    reference_number: 'ADJ-001',
    reference_type: 'ADJUSTMENT',
    reason: 'Damaged items - write off',
    notes: 'Physical count adjustment',
    created_at: '2025-01-09'
  }
];

function nextId() {
  return `mv-${Math.random().toString(36).slice(2, 8)}`;
}

// Map backend stock movement response to frontend format
function mapBackendStockMovement(backendMovement: any): StockMovement {
  const movementId = backendMovement.id?.toString() || backendMovement.movement_id?.toString() || backendMovement.stock_movement_id?.toString();

  // Handle from/to as objects (warehouse objects)
  let fromLocation = '';
  let toLocation = '';
  
  if (backendMovement.from && typeof backendMovement.from === 'object' && backendMovement.from !== null) {
    fromLocation = backendMovement.from.name || backendMovement.from.warehouse_code || backendMovement.from.warehouse_name || '';
  } else {
    fromLocation = backendMovement.from_location || backendMovement.source_location || '';
  }
  
  if (backendMovement.to && typeof backendMovement.to === 'object' && backendMovement.to !== null) {
    toLocation = backendMovement.to.name || backendMovement.to.warehouse_code || backendMovement.to.warehouse_name || '';
  } else {
    toLocation = backendMovement.to_location || backendMovement.destination_location || '';
  }

  // Map movement_type: "IN" -> "RECEIPT", "OUT" -> "SHIPMENT", etc.
  let movementType = backendMovement.movement_type || backendMovement.type || 'TRANSFER';
  if (movementType === 'IN') {
    movementType = 'RECEIPT';
  } else if (movementType === 'OUT') {
    movementType = 'SHIPMENT';
  }

  // Format movement_date
  let movementDate = '';
  if (backendMovement.movement_date) {
    const date = new Date(backendMovement.movement_date);
    movementDate = date.toISOString().split('T')[0];
  } else if (backendMovement.created_at) {
    const date = new Date(backendMovement.created_at);
    movementDate = date.toISOString().split('T')[0];
  } else {
    movementDate = new Date().toISOString().split('T')[0];
  }

  return {
    id: movementId,
    movement_number: backendMovement.movement_number || backendMovement.movement_no || backendMovement.movement_ref || `MV-${movementId}`,
    item_id: backendMovement.product_id?.toString() || backendMovement.item_id?.toString() || '',
    item_name: backendMovement.item_name || backendMovement.product_name || undefined,
    item_sku: backendMovement.item_sku || backendMovement.sku || backendMovement.product_code || undefined,
    movement_type: movementType as any,
    status: backendMovement.status || 'PENDING',
    movement_date: movementDate,
    completed_date: backendMovement.completed_date ? new Date(backendMovement.completed_date).toISOString().split('T')[0] : undefined,
    from_location: fromLocation,
    from_zone: backendMovement.from_zone || backendMovement.source_zone || undefined,
    from_bin: backendMovement.from_bin || backendMovement.source_bin || undefined,
    to_location: toLocation,
    to_zone: backendMovement.to_zone || backendMovement.destination_zone || undefined,
    to_bin: backendMovement.to_bin || backendMovement.destination_bin || undefined,
    quantity: Number(backendMovement.quantity) || 0,
    unit: backendMovement.unit || 'pcs',
    available_quantity: backendMovement.available_quantity ? Number(backendMovement.available_quantity) : undefined,
    received_quantity: backendMovement.received_quantity ? Number(backendMovement.received_quantity) : undefined,
    reference_number: backendMovement.reference_id?.toString() || backendMovement.reference_number || backendMovement.ref_number || undefined,
    reference_type: backendMovement.reference_type || backendMovement.ref_type || undefined,
    batch_number: backendMovement.batch_number || backendMovement.batch_no || undefined,
    lot_number: backendMovement.lot_number || backendMovement.lot_no || undefined,
    serial_numbers: backendMovement.serial_numbers ? (Array.isArray(backendMovement.serial_numbers) ? backendMovement.serial_numbers : JSON.parse(backendMovement.serial_numbers)) : undefined,
    assigned_to: backendMovement.assigned_to || backendMovement.assigned_to_name || undefined,
    operator_name: backendMovement.operator_name || backendMovement.operator || undefined,
    supervisor: backendMovement.supervisor || backendMovement.supervisor_name || undefined,
    quality_check_required: backendMovement.quality_check_required || false,
    quality_check_passed: backendMovement.quality_check_passed !== undefined ? backendMovement.quality_check_passed : undefined,
    inspected_by: backendMovement.inspected_by || backendMovement.inspector_name || undefined,
    inspection_date: backendMovement.inspection_date ? new Date(backendMovement.inspection_date).toISOString().split('T')[0] : undefined,
    carrier: backendMovement.carrier || backendMovement.shipping_carrier || undefined,
    tracking_number: backendMovement.tracking_number || backendMovement.tracking_no || undefined,
    expected_arrival_date: backendMovement.expected_arrival_date ? new Date(backendMovement.expected_arrival_date).toISOString().split('T')[0] : undefined,
    actual_arrival_date: backendMovement.actual_arrival_date ? new Date(backendMovement.actual_arrival_date).toISOString().split('T')[0] : undefined,
    unit_cost: backendMovement.unit_cost ? Number(backendMovement.unit_cost) : undefined,
    total_cost: backendMovement.total_cost ? Number(backendMovement.total_cost) : undefined,
    currency: backendMovement.currency || 'INR',
    reason: backendMovement.reason || backendMovement.movement_reason || undefined,
    notes: backendMovement.notes || backendMovement.description || undefined,
    internal_notes: backendMovement.internal_notes || backendMovement.private_notes || undefined,
    tags: backendMovement.tags ? (Array.isArray(backendMovement.tags) ? backendMovement.tags : JSON.parse(backendMovement.tags)) : undefined,
    created_at: backendMovement.created_at || new Date().toISOString(),
    updated_at: backendMovement.updated_at || backendMovement.modified_at || undefined,
  };
}

// List all stock movements
export async function listStockMovements(): Promise<StockMovement[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching stock movements from backend API...');
      const response = await apiRequest<{ success: boolean; data: { stock_movements: any[] } } | { stock_movements: any[] } | any[]>(
        '/warehouse/stock-movements?page=1&limit=100'
      );

      console.log('📦 Backend stock movements response:', response);

      // Handle different response formats
      let movements = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.stock_movements) {
          movements = response.data.stock_movements;
        } else if ('stock_movements' in response) {
          movements = response.stock_movements;
        } else if (Array.isArray(response)) {
          movements = response;
        }
      }

      if (movements.length > 0) {
        const mapped = movements.map(mapBackendStockMovement);
        console.log('✅ Mapped stock movements:', mapped.length);
        console.log('📊 Sample movement statuses:', mapped.slice(0, 5).map(m => ({ id: m.id, status: m.status, movement_type: m.movement_type })));
        return mapped;
      }

      console.log('⚠️ No stock movements in response, using mock data');
      return mockMovements;
    } catch (error) {
      console.error('❌ Backend API error, falling back to mock data:', error);
      return mockMovements;
    }
  }

  if (useStatic) return mockMovements;

  try {
    const { data, error } = await supabase.from('stock_movements').select('*');
    if (error) throw error;
    return (data as StockMovement[]) ?? [];
  } catch (error) {
    handleApiError('warehouse.listStockMovements', error);
    useStatic = true;
    return mockMovements;
  }
}

// Create a new stock movement
export async function createStockMovement(
  payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
): Promise<StockMovement> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating stock movement via backend API:', payload);

      // Map frontend format to backend format
      const backendPayload: any = {
        movement_number: payload.movement_number,
        item_id: payload.item_id,
        item_name: payload.item_name,
        item_sku: payload.item_sku,
        movement_type: payload.movement_type,
        status: payload.status || 'PENDING',
        movement_date: payload.movement_date,
        completed_date: payload.completed_date,
        from_location: payload.from_location,
        from_zone: payload.from_zone,
        from_bin: payload.from_bin,
        to_location: payload.to_location,
        to_zone: payload.to_zone,
        to_bin: payload.to_bin,
        quantity: payload.quantity,
        unit: payload.unit || 'pcs',
        available_quantity: payload.available_quantity,
        received_quantity: payload.received_quantity,
        reference_number: payload.reference_number,
        reference_type: payload.reference_type,
        batch_number: payload.batch_number,
        lot_number: payload.lot_number,
        serial_numbers: payload.serial_numbers,
        assigned_to: payload.assigned_to,
        operator_name: payload.operator_name,
        supervisor: payload.supervisor,
        quality_check_required: payload.quality_check_required || false,
        quality_check_passed: payload.quality_check_passed,
        inspected_by: payload.inspected_by,
        inspection_date: payload.inspection_date,
        carrier: payload.carrier,
        tracking_number: payload.tracking_number,
        expected_arrival_date: payload.expected_arrival_date,
        actual_arrival_date: payload.actual_arrival_date,
        unit_cost: payload.unit_cost,
        total_cost: payload.total_cost,
        currency: payload.currency || 'INR',
        reason: payload.reason,
        notes: payload.notes,
        internal_notes: payload.internal_notes,
        tags: payload.tags,
      };

      // Remove undefined values
      Object.keys(backendPayload).forEach(key => {
        if (backendPayload[key] === undefined) {
          delete backendPayload[key];
        }
      });

      console.log('📤 Backend payload:', backendPayload);

      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        '/warehouse/stock-movements',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('📥 Create response:', response);

      if (response.success && response.data) {
        const created = mapBackendStockMovement(response.data.stock_movement || response.data);
        console.log('✅ Stock movement created successfully:', created);
        return created;
      }

      throw new Error(response.message || 'Failed to create stock movement');
    } catch (error: any) {
      console.error('❌ Backend create error:', error);
      throw new Error(error.message || 'Failed to create stock movement');
    }
  }

  if (useStatic) {
    const mv: StockMovement = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockMovements.unshift(mv);
    return mv;
  }

  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as StockMovement;
  } catch (error) {
    handleApiError('warehouse.createStockMovement', error);
    useStatic = true;
    return createStockMovement(payload);
  }
}

// Update an existing stock movement
export async function updateStockMovement(
  id: string,
  changes: Partial<StockMovement>
): Promise<StockMovement | null> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating stock movement via backend API:', { id, changes });

      // Map frontend format to backend format (only include changed fields)
      const backendPayload: any = {};
      if (changes.status !== undefined) backendPayload.status = changes.status;
      if (changes.completed_date !== undefined) backendPayload.completed_date = changes.completed_date;
      if (changes.received_quantity !== undefined) backendPayload.received_quantity = changes.received_quantity;
      if (changes.quality_check_passed !== undefined) backendPayload.quality_check_passed = changes.quality_check_passed;
      if (changes.inspected_by !== undefined) backendPayload.inspected_by = changes.inspected_by;
      if (changes.inspection_date !== undefined) backendPayload.inspection_date = changes.inspection_date;
      if (changes.actual_arrival_date !== undefined) backendPayload.actual_arrival_date = changes.actual_arrival_date;
      if (changes.notes !== undefined) backendPayload.notes = changes.notes;
      if (changes.internal_notes !== undefined) backendPayload.internal_notes = changes.internal_notes;
      if (changes.operator_name !== undefined) backendPayload.operator_name = changes.operator_name;
      if (changes.assigned_to !== undefined) backendPayload.assigned_to = changes.assigned_to;
      if (changes.tracking_number !== undefined) backendPayload.tracking_number = changes.tracking_number;
      if (changes.carrier !== undefined) backendPayload.carrier = changes.carrier;
      if (changes.unit_cost !== undefined) backendPayload.unit_cost = changes.unit_cost;
      if (changes.total_cost !== undefined) backendPayload.total_cost = changes.total_cost;
      if (changes.currency !== undefined) backendPayload.currency = changes.currency;

      console.log('📤 Backend update payload:', backendPayload);

      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/warehouse/stock-movements/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('📥 Update response:', response);

      if (response.success && response.data) {
        const updated = mapBackendStockMovement(response.data.stock_movement || response.data);
        console.log('✅ Stock movement updated successfully:', updated);
        return updated;
      }

      throw new Error(response.message || 'Failed to update stock movement');
    } catch (error: any) {
      console.error('❌ Backend update error:', error);
      throw new Error(error.message || 'Failed to update stock movement');
    }
  }

  if (useStatic) {
    const index = mockMovements.findIndex((m) => m.id === id);
    if (index === -1) return null;
    mockMovements[index] = { ...mockMovements[index], ...changes };
    return mockMovements[index];
  }

  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as StockMovement;
  } catch (error) {
    handleApiError('warehouse.updateStockMovement', error);
    useStatic = true;
    return updateStockMovement(id, changes);
  }
}

// Delete a stock movement
export async function deleteStockMovement(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting stock movement via backend API:', id);

      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/warehouse/stock-movements/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('📥 Delete response:', response);

      if (response.success) {
        console.log('✅ Stock movement deleted successfully');
        return;
      }

      throw new Error(response.message || 'Failed to delete stock movement');
    } catch (error: any) {
      console.error('❌ Backend delete error:', error);
      throw new Error(error.message || 'Failed to delete stock movement');
    }
  }

  if (useStatic) {
    const index = mockMovements.findIndex((m) => m.id === id);
    if (index !== -1) mockMovements.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('stock_movements').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('warehouse.deleteStockMovement', error);
    useStatic = true;
    await deleteStockMovement(id);
  }
}

// Map backend warehouse response to frontend format
function mapBackendWarehouse(backendWarehouse: any): Warehouse {
  const warehouseId = backendWarehouse.id?.toString() || backendWarehouse.warehouse_id?.toString();

  return {
    id: warehouseId,
    warehouse_code: backendWarehouse.warehouse_code || backendWarehouse.code || '',
    name: backendWarehouse.name || backendWarehouse.warehouse_name || '',
    address: backendWarehouse.address || undefined,
    city: backendWarehouse.city || undefined,
    state: backendWarehouse.state || undefined,
    pincode: backendWarehouse.pincode || backendWarehouse.postal_code || undefined,
    country: backendWarehouse.country || undefined,
    manager_id: backendWarehouse.manager_id ? Number(backendWarehouse.manager_id) : undefined,
    capacity: backendWarehouse.capacity ? Number(backendWarehouse.capacity) : undefined,
    is_active: backendWarehouse.is_active !== undefined ? backendWarehouse.is_active : true,
    created_at: backendWarehouse.created_at || new Date().toISOString(),
    updated_at: backendWarehouse.updated_at || backendWarehouse.modified_at || undefined,
  };
}

// List all warehouses
export async function listWarehouses(): Promise<Warehouse[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching warehouses from backend API...');
      const response = await apiRequest<{ success: boolean; data: { warehouses: any[] } } | { warehouses: any[] } | any[]>(
        '/warehouse/warehouses?page=1&limit=100'
      );

      console.log('🏭 Backend warehouses response:', response);

      // Handle different response formats
      let warehouses = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.warehouses) {
          warehouses = response.data.warehouses;
        } else if ('warehouses' in response) {
          warehouses = response.warehouses;
        } else if (Array.isArray(response)) {
          warehouses = response;
        }
      }

      if (warehouses.length > 0) {
        const mapped = warehouses.map(mapBackendWarehouse);
        console.log('✅ Mapped warehouses:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No warehouses in response');
      return [];
    } catch (error) {
      console.error('❌ Backend API error:', error);
      return [];
    }
  }

  return [];
}

// Create a new warehouse
export async function createWarehouse(
  payload: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>
): Promise<Warehouse> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating warehouse via backend API:', payload);

      // Map frontend format to backend format
      const backendPayload: any = {
        warehouse_code: payload.warehouse_code,
        name: payload.name,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        country: payload.country,
        manager_id: payload.manager_id,
        capacity: payload.capacity,
        is_active: payload.is_active !== undefined ? payload.is_active : true,
      };

      // Remove undefined values
      Object.keys(backendPayload).forEach(key => {
        if (backendPayload[key] === undefined) {
          delete backendPayload[key];
        }
      });

      console.log('📤 Backend payload:', backendPayload);

      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        '/warehouse/warehouses',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('📥 Create response:', response);

      if (response.success && response.data) {
        const created = mapBackendWarehouse(response.data.warehouse || response.data);
        console.log('✅ Warehouse created successfully:', created);
        return created;
      }

      throw new Error(response.message || 'Failed to create warehouse');
    } catch (error: any) {
      console.error('❌ Backend create error:', error);
      throw new Error(error.message || 'Failed to create warehouse');
    }
  }

  throw new Error('Backend API not enabled');
}

// Update an existing warehouse
export async function updateWarehouse(
  id: string,
  changes: Partial<Warehouse>
): Promise<Warehouse | null> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating warehouse via backend API:', { id, changes });

      // Map frontend format to backend format (only include changed fields)
      const backendPayload: any = {};
      if (changes.warehouse_code !== undefined) backendPayload.warehouse_code = changes.warehouse_code;
      if (changes.name !== undefined) backendPayload.name = changes.name;
      if (changes.address !== undefined) backendPayload.address = changes.address;
      if (changes.city !== undefined) backendPayload.city = changes.city;
      if (changes.state !== undefined) backendPayload.state = changes.state;
      if (changes.pincode !== undefined) backendPayload.pincode = changes.pincode;
      if (changes.country !== undefined) backendPayload.country = changes.country;
      if (changes.manager_id !== undefined) backendPayload.manager_id = changes.manager_id;
      if (changes.capacity !== undefined) backendPayload.capacity = changes.capacity;
      if (changes.is_active !== undefined) backendPayload.is_active = changes.is_active;

      console.log('📤 Backend update payload:', backendPayload);

      const response = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/warehouse/warehouses/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendPayload),
        }
      );

      console.log('📥 Update response:', response);

      if (response.success && response.data) {
        const updated = mapBackendWarehouse(response.data.warehouse || response.data);
        console.log('✅ Warehouse updated successfully:', updated);
        return updated;
      }

      throw new Error(response.message || 'Failed to update warehouse');
    } catch (error: any) {
      console.error('❌ Backend update error:', error);
      throw new Error(error.message || 'Failed to update warehouse');
    }
  }

  throw new Error('Backend API not enabled');
}

// Delete a warehouse
export async function deleteWarehouse(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting warehouse via backend API:', id);

      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/warehouse/warehouses/${id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('📥 Delete response:', response);

      if (response.success) {
        console.log('✅ Warehouse deleted successfully');
        return;
      }

      throw new Error(response.message || 'Failed to delete warehouse');
    } catch (error: any) {
      console.error('❌ Backend delete error:', error);
      throw new Error(error.message || 'Failed to delete warehouse');
    }
  }

  throw new Error('Backend API not enabled');
}
