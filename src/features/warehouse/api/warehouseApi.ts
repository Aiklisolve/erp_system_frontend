import { apiRequest } from '../../../config/api';
import type { StockMovement, Warehouse } from '../types';

// Backend stock movement structure (matches actual database schema)
interface BackendStockMovement {
  id: number;
  product_id: number;
  warehouse_id?: number; // single warehouse ID (actual column)
  from?: number; // warehouse ID (if exists)
  to?: number; // warehouse ID (if exists)
  movement_type: string;
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  movement_date?: string; // timestamp (aliased from created_at if doesn't exist)
  notes?: string;
  status?: string; // aliased as 'Pending' if doesn't exist
  created_by?: number;
  created_at?: string;
  item_id?: string;
  item_name?: string;
  item_sku?: string;
  unit?: string;
  from_location?: string; // warehouse name from JOIN
  to_location?: string; // warehouse name from JOIN
  from_warehouse_code?: string;
  to_warehouse_code?: string;
}

interface StockMovementListResponse {
  success: boolean;
  data: {
    movements: BackendStockMovement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface StockMovementResponse {
  success: boolean;
  data: BackendStockMovement;
}

// Map backend structure to frontend structure
function mapBackendToFrontend(backend: BackendStockMovement): StockMovement {
  // Use movement_date if available, otherwise use created_at
  const movementDate = backend.movement_date 
    ? (typeof backend.movement_date === 'string' ? backend.movement_date.split('T')[0] : new Date(backend.movement_date).toISOString().split('T')[0])
    : (backend.created_at 
      ? (typeof backend.created_at === 'string' ? backend.created_at.split('T')[0] : new Date(backend.created_at).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0]);
  
  // Map status from database (e.g., "Pending", "Completed") to frontend format
  const mapStatus = (status?: string): StockMovement['status'] => {
    if (!status) return 'PENDING';
    const upper = status.toUpperCase();
    if (upper === 'COMPLETED' || upper === 'COMPLETE') return 'COMPLETED';
    if (upper === 'CANCELLED' || upper === 'CANCEL') return 'CANCELLED';
    if (upper === 'IN_PROGRESS' || upper === 'IN PROGRESS') return 'IN_PROGRESS';
    return 'PENDING';
  };

  // Use warehouse names from JOIN if available, otherwise construct from IDs
  // Handle both warehouse_id (single) and from/to (if they exist)
  const warehouseId = backend.warehouse_id || backend.from;
  const fromLocation = backend.from_location || (warehouseId ? `WH-${warehouseId}` : '');
  const toLocation = backend.to_location || (backend.to ? `WH-${backend.to}` : fromLocation);

  return {
    id: backend.id.toString(),
    movement_number: `MV-${backend.id}`,
    item_id: backend.item_id || backend.item_sku || `PROD-${backend.product_id}`,
    item_name: backend.item_name || '',
    item_sku: backend.item_sku || backend.item_id || `PROD-${backend.product_id}`,
    movement_type: (backend.movement_type || 'TRANSFER') as StockMovement['movement_type'],
    status: mapStatus(backend.status),
    movement_date: movementDate,
    from_location: fromLocation,
    to_location: toLocation,
    quantity: backend.quantity || 0,
    unit: backend.unit || 'pcs',
    reference_number: backend.reference_id?.toString(),
    reference_type: (backend.reference_type || 'OTHER') as StockMovement['reference_type'],
    notes: backend.notes || undefined,
    created_at: backend.created_at || backend.movement_date || new Date().toISOString()
  };
}

// Map frontend structure to backend structure
function mapFrontendToBackend(frontend: Partial<StockMovement & { product_id?: number; warehouse_id?: number }>): Partial<BackendStockMovement> {
  const backend: Partial<BackendStockMovement> = {};
  
  if (frontend.movement_type) backend.movement_type = frontend.movement_type;
  if (frontend.quantity !== undefined) backend.quantity = frontend.quantity;
  if (frontend.reference_type) backend.reference_type = frontend.reference_type;
  if (frontend.notes !== undefined) backend.notes = frontend.notes || undefined;
  
  // Use product_id directly if provided (from form), otherwise try to extract from item_id
  if ((frontend as any).product_id) {
    backend.product_id = (frontend as any).product_id;
  } else if (frontend.item_id) {
    // Try to parse as number (assuming it's a product_id)
    const productId = parseInt(frontend.item_id);
    if (!isNaN(productId) && productId > 0) {
      backend.product_id = productId;
    }
  }
  
  // Map from/to locations to warehouse_id
  // Database uses warehouse_id column (single warehouse)
  // Use from_location as the primary warehouse
  if ((frontend as any).warehouse_id !== undefined) {
    (backend as any).warehouse_id = (frontend as any).warehouse_id;
  } else if ((frontend as any).from !== undefined) {
    (backend as any).warehouse_id = (frontend as any).from;
  } else if (frontend.from_location) {
    const warehouseMatch = frontend.from_location.match(/WH-(\d+)/);
    if (warehouseMatch) {
      (backend as any).warehouse_id = parseInt(warehouseMatch[1]);
    }
  }

  // Map movement_date
  if (frontend.movement_date) {
    (backend as any).movement_date = frontend.movement_date;
  }

  // Map status
  if (frontend.status) {
    (backend as any).status = frontend.status;
  }
  
  // Extract reference_id from reference_number if it's numeric
  if (frontend.reference_number) {
    const refId = parseInt(frontend.reference_number);
    if (!isNaN(refId) && refId > 0) {
      backend.reference_id = refId;
    }
  }
  
  return backend;
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
  try {
    console.log('Fetching stock movements from:', '/inventory/stock/movements');
    // Request a large limit to get all movements (or implement pagination later)
    const response = await apiRequest<StockMovementListResponse>('/inventory/stock/movements?limit=1000&page=1');
    console.log('Stock movements API response:', response);
    
    if (!response) {
      console.warn('No response received');
      return [];
    }
    
    if (!response.success) {
      console.warn('API returned success: false', response);
      return [];
    }
    
    if (!response.data) {
      console.warn('No data in response:', response);
      return [];
    }
    
    if (!response.data.movements) {
      console.warn('No movements array in response.data:', response.data);
      return [];
    }
    
    if (!Array.isArray(response.data.movements)) {
      console.warn('Movements is not an array:', typeof response.data.movements, response.data.movements);
      return [];
    }
    
    console.log('Raw movements from API:', response.data.movements);
    console.log('Movements count:', response.data.movements.length);
    
    if (response.data.movements.length === 0) {
      console.log('No stock movements found in database');
      return [];
    }
    
    const mapped = response.data.movements.map(mapBackendToFrontend);
    console.log('Mapped stock movements:', mapped);
    return mapped;
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error details:', String(error));
    }
    return [];
  }
}

// Create a new stock movement
export async function createStockMovement(
  payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
): Promise<StockMovement> {
  try {
    const backendPayload = mapFrontendToBackend(payload);
    const response = await apiRequest<StockMovementResponse>('/inventory/stock/movements', {
      method: 'POST',
      body: JSON.stringify(backendPayload)
    });
    return mapBackendToFrontend(response.data);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    throw error;
  }
}

// Update an existing stock movement
export async function updateStockMovement(
  id: string,
  changes: Partial<StockMovement>
): Promise<StockMovement | null> {
  try {
    const backendPayload = mapFrontendToBackend(changes);
    const response = await apiRequest<StockMovementResponse>(`/inventory/stock/movements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendPayload)
    });
    return mapBackendToFrontend(response.data);
  } catch (error) {
    console.error('Error updating stock movement:', error);
    throw error;
  }
}

// Delete a stock movement
export async function deleteStockMovement(id: string): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>(`/inventory/stock/movements/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting stock movement:', error);
    throw error;
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
