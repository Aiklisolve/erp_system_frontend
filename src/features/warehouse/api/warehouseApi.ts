import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { StockMovement } from '../types';

let useStatic = !hasSupabaseConfig;

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
    currency: 'USD',
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
    currency: 'USD',
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
    currency: 'USD',
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

export async function listStockMovements(): Promise<StockMovement[]> {
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

export async function createStockMovement(
  payload: Omit<StockMovement, 'id' | 'created_at' | 'updated_at'>
): Promise<StockMovement> {
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

export async function updateStockMovement(
  id: string,
  changes: Partial<StockMovement>
): Promise<StockMovement | null> {
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

export async function deleteStockMovement(id: string): Promise<void> {
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


