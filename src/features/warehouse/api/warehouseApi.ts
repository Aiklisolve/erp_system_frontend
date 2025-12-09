import { apiRequest } from '../../../config/api';
import type { StockMovement } from '../types';

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


