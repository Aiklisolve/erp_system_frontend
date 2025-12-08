import type { BaseEntity } from '../../types/common';

export type MovementType = 'TRANSFER' | 'RECEIPT' | 'SHIPMENT' | 'ADJUSTMENT' | 'RETURN' | 'CYCLE_COUNT';
export type MovementStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WarehouseZone = 'RECEIVING' | 'STORAGE' | 'PICKING' | 'PACKING' | 'SHIPPING' | 'QUARANTINE';

export interface StockMovement extends BaseEntity {
  movement_number?: string; // Auto-generated movement reference
  item_id: string;
  item_name?: string;
  item_sku?: string;
  
  // Movement details
  movement_type: MovementType;
  status: MovementStatus;
  movement_date: string;
  completed_date?: string;
  
  // Locations
  from_location: string;
  from_zone?: WarehouseZone;
  from_bin?: string;
  to_location: string;
  to_zone?: WarehouseZone;
  to_bin?: string;
  
  // Quantities
  quantity: number;
  unit?: string;
  available_quantity?: number; // Available at source before movement
  received_quantity?: number; // Actually received at destination
  
  // References
  reference_number?: string; // PO, SO, or other reference
  reference_type?: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER_ORDER' | 'ADJUSTMENT' | 'OTHER';
  batch_number?: string;
  lot_number?: string;
  serial_numbers?: string[]; // For serialized items
  
  // Assignment
  assigned_to?: string;
  operator_name?: string;
  supervisor?: string;
  
  // Quality & Compliance
  quality_check_required?: boolean;
  quality_check_passed?: boolean;
  inspected_by?: string;
  inspection_date?: string;
  
  // Shipping & Receiving
  carrier?: string;
  tracking_number?: string;
  expected_arrival_date?: string;
  actual_arrival_date?: string;
  
  // Cost & Valuation
  unit_cost?: number;
  total_cost?: number;
  currency?: string;
  
  // Additional
  reason?: string; // Reason for movement/adjustment
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}

// Warehouse Location
export interface WarehouseLocation extends BaseEntity {
  location_code: string;
  location_name: string;
  warehouse_name?: string;
  zone?: WarehouseZone;
  bin?: string;
  aisle?: string;
  shelf?: string;
  capacity?: number; // Maximum capacity
  current_occupancy?: number; // Current occupancy
  temperature_controlled?: boolean;
  hazardous_storage?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  address?: string;
  notes?: string;
}

// Receiving Record
export interface ReceivingRecord extends BaseEntity {
  receiving_number?: string;
  purchase_order_number?: string;
  supplier?: string;
  received_date: string;
  expected_date?: string;
  status: MovementStatus;
  items: ReceivingItem[];
  received_by?: string;
  inspected_by?: string;
  notes?: string;
}

export interface ReceivingItem {
  item_id: string;
  item_name?: string;
  expected_quantity: number;
  received_quantity: number;
  unit?: string;
  batch_number?: string;
  lot_number?: string;
  condition?: 'GOOD' | 'DAMAGED' | 'SHORT' | 'OVER';
}

// Warehouse
export interface Warehouse extends BaseEntity {
  warehouse_code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  manager_id?: number;
  capacity?: number;
  is_active?: boolean;
}
