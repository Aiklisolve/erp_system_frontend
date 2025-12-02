import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { ProductionOrder } from '../types';

let useStatic = !hasSupabaseConfig;

const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'mo-001',
    production_order_number: 'MO-2025-001',
    work_order_number: 'WO-2025-001',
    reference_number: 'REF-MFG-001',
    sales_order_number: 'SO-2025-001',
    product: 'Industrial Pump - Model IP-500',
    product_code: 'IP-500',
    product_id: 'prod-001',
    product_description: 'High-pressure industrial water pump',
    bom_number: 'BOM-IP500-V1',
    bom_version: 'V1.2',
    planned_qty: 50,
    produced_qty: 32,
    good_qty: 30,
    scrap_qty: 2,
    rework_qty: 0,
    pending_qty: 18,
    unit: 'Units',
    start_date: '2025-01-02',
    end_date: '2025-01-25',
    planned_start_date: '2025-01-02',
    planned_end_date: '2025-01-25',
    actual_start_date: '2025-01-02',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    production_type: 'MAKE_TO_ORDER',
    estimated_cost: 125000,
    actual_cost: 85000,
    material_cost: 60000,
    labor_cost: 20000,
    overhead_cost: 5000,
    cost: 85000,
    currency: 'USD',
    batch_number: 'BATCH-2025-001',
    lot_number: 'LOT-IP500-001',
    shift: 'Day Shift',
    production_line: 'Line A',
    work_center: 'Assembly Center 1',
    machine_id: 'MACH-001',
    progress_percentage: 64,
    completion_percentage: 60,
    efficiency_percentage: 92,
    yield_percentage: 93.75,
    estimated_hours: 400,
    actual_hours: 256,
    setup_time_hours: 8,
    run_time_hours: 240,
    downtime_hours: 8,
    supervisor: 'John Smith',
    supervisor_id: 'emp-001',
    assigned_team: ['Production Team A', 'Assembly Team 1'],
    operators: ['Operator 1', 'Operator 2', 'Operator 3'],
    quality_check_required: true,
    quality_status: 'PASSED',
    inspected_by: 'QC Inspector - Mike Wilson',
    inspection_date: '2025-01-20',
    inspection_notes: 'All units passed quality inspection',
    raw_materials_allocated: true,
    raw_materials_issued: true,
    tools_allocated: true,
    customer_name: 'Acme Manufacturing Corp',
    customer_id: 'CUST-001',
    project_id: 'PROJ-2025-001',
    department: 'Production',
    description: 'Production order for 50 units of IP-500 industrial pumps',
    notes: 'Customer requires delivery by end of January',
    special_instructions: 'Use high-grade stainless steel for all components',
    tags: ['pumps', 'industrial', 'high-priority'],
    created_at: '2025-01-02'
  },
  {
    id: 'mo-002',
    production_order_number: 'MO-2025-002',
    work_order_number: 'WO-2025-002',
    reference_number: 'REF-MFG-002',
    product: 'Hydraulic Cylinder - Model HC-300',
    product_code: 'HC-300',
    product_id: 'prod-002',
    product_description: 'Heavy-duty hydraulic cylinder',
    bom_number: 'BOM-HC300-V1',
    bom_version: 'V1.0',
    planned_qty: 100,
    produced_qty: 0,
    good_qty: 0,
    scrap_qty: 0,
    rework_qty: 0,
    pending_qty: 100,
    unit: 'Units',
    start_date: '2025-01-20',
    end_date: '2025-02-15',
    planned_start_date: '2025-01-20',
    planned_end_date: '2025-02-15',
    status: 'SCHEDULED',
    priority: 'MEDIUM',
    production_type: 'MAKE_TO_STOCK',
    estimated_cost: 85000,
    material_cost: 55000,
    labor_cost: 25000,
    overhead_cost: 5000,
    cost: 85000,
    currency: 'USD',
    batch_number: 'BATCH-2025-002',
    shift: 'Day Shift',
    production_line: 'Line B',
    work_center: 'Machining Center 2',
    progress_percentage: 0,
    completion_percentage: 0,
    estimated_hours: 600,
    supervisor: 'Sarah Johnson',
    supervisor_id: 'emp-002',
    assigned_team: ['Production Team B'],
    quality_check_required: true,
    quality_status: 'PENDING',
    raw_materials_allocated: true,
    raw_materials_issued: false,
    tools_allocated: true,
    department: 'Production',
    description: 'Stock replenishment for HC-300 hydraulic cylinders',
    notes: 'Standard production run',
    tags: ['hydraulic', 'cylinders', 'stock'],
    created_at: '2025-01-10'
  },
  {
    id: 'mo-003',
    production_order_number: 'MO-2025-003',
    work_order_number: 'WO-2025-003',
    sales_order_number: 'SO-2025-003',
    product: 'Gear Assembly - Model GA-150',
    product_code: 'GA-150',
    product_id: 'prod-003',
    product_description: 'Precision gear assembly for industrial machinery',
    bom_number: 'BOM-GA150-V2',
    bom_version: 'V2.1',
    planned_qty: 200,
    produced_qty: 200,
    good_qty: 195,
    scrap_qty: 3,
    rework_qty: 2,
    pending_qty: 0,
    unit: 'Units',
    start_date: '2024-12-15',
    end_date: '2025-01-10',
    planned_start_date: '2024-12-15',
    planned_end_date: '2025-01-10',
    actual_start_date: '2024-12-15',
    actual_end_date: '2025-01-09',
    status: 'COMPLETED',
    priority: 'HIGH',
    production_type: 'MAKE_TO_ORDER',
    estimated_cost: 95000,
    actual_cost: 92000,
    material_cost: 65000,
    labor_cost: 22000,
    overhead_cost: 5000,
    cost: 92000,
    currency: 'USD',
    batch_number: 'BATCH-2024-015',
    lot_number: 'LOT-GA150-015',
    shift: 'Day Shift',
    production_line: 'Line A',
    work_center: 'Assembly Center 1',
    machine_id: 'MACH-002',
    progress_percentage: 100,
    completion_percentage: 100,
    efficiency_percentage: 96,
    yield_percentage: 97.5,
    estimated_hours: 800,
    actual_hours: 780,
    setup_time_hours: 12,
    run_time_hours: 760,
    downtime_hours: 8,
    supervisor: 'Tom Brown',
    supervisor_id: 'emp-003',
    assigned_team: ['Production Team A', 'Assembly Team 2'],
    operators: ['Operator 4', 'Operator 5', 'Operator 6', 'Operator 7'],
    quality_check_required: true,
    quality_status: 'PASSED',
    inspected_by: 'QC Inspector - Lisa Anderson',
    inspection_date: '2025-01-09',
    inspection_notes: '195 units passed, 3 scrapped, 2 sent for rework',
    raw_materials_allocated: true,
    raw_materials_issued: true,
    tools_allocated: true,
    customer_name: 'Tech Solutions Inc',
    customer_id: 'CUST-002',
    project_id: 'PROJ-2025-002',
    department: 'Production',
    description: 'Custom gear assembly production for Tech Solutions project',
    notes: 'Completed ahead of schedule',
    special_instructions: 'Use precision machining for all gear teeth',
    tags: ['gears', 'assembly', 'completed', 'high-precision'],
    created_at: '2024-12-10'
  },
  {
    id: 'mo-004',
    production_order_number: 'MO-2025-004',
    work_order_number: 'WO-2025-004',
    product: 'Steel Frame - Model SF-200',
    product_code: 'SF-200',
    product_id: 'prod-004',
    product_description: 'Heavy-duty steel frame for industrial equipment',
    bom_number: 'BOM-SF200-V1',
    bom_version: 'V1.0',
    planned_qty: 75,
    produced_qty: 0,
    good_qty: 0,
    scrap_qty: 0,
    pending_qty: 75,
    unit: 'Units',
    start_date: '2025-01-25',
    end_date: '2025-02-20',
    planned_start_date: '2025-01-25',
    planned_end_date: '2025-02-20',
    status: 'PLANNED',
    priority: 'MEDIUM',
    production_type: 'BATCH',
    estimated_cost: 112000,
    material_cost: 75000,
    labor_cost: 30000,
    overhead_cost: 7000,
    cost: 112000,
    currency: 'USD',
    shift: 'Day Shift',
    production_line: 'Line C',
    work_center: 'Fabrication Center 1',
    progress_percentage: 0,
    completion_percentage: 0,
    estimated_hours: 500,
    supervisor: 'Mike Wilson',
    supervisor_id: 'emp-004',
    assigned_team: ['Fabrication Team'],
    quality_check_required: true,
    quality_status: 'PENDING',
    raw_materials_allocated: false,
    raw_materials_issued: false,
    tools_allocated: false,
    department: 'Production',
    description: 'Steel frame production for equipment assembly',
    notes: 'Awaiting raw material delivery',
    tags: ['steel', 'frames', 'fabrication'],
    created_at: '2025-01-15'
  },
  {
    id: 'mo-005',
    production_order_number: 'MO-2025-005',
    work_order_number: 'WO-2025-005',
    reference_number: 'REF-MFG-005',
    product: 'Control Panel - Model CP-100',
    product_code: 'CP-100',
    product_id: 'prod-005',
    product_description: 'Electronic control panel for industrial automation',
    bom_number: 'BOM-CP100-V3',
    bom_version: 'V3.0',
    planned_qty: 30,
    produced_qty: 15,
    good_qty: 14,
    scrap_qty: 1,
    rework_qty: 0,
    pending_qty: 15,
    unit: 'Units',
    start_date: '2025-01-12',
    end_date: '2025-01-30',
    planned_start_date: '2025-01-12',
    planned_end_date: '2025-01-30',
    actual_start_date: '2025-01-12',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    production_type: 'ASSEMBLY',
    estimated_cost: 45000,
    actual_cost: 24000,
    material_cost: 18000,
    labor_cost: 5000,
    overhead_cost: 1000,
    cost: 24000,
    currency: 'USD',
    batch_number: 'BATCH-2025-005',
    lot_number: 'LOT-CP100-005',
    shift: 'Day Shift',
    production_line: 'Electronics Line',
    work_center: 'Electronics Assembly',
    progress_percentage: 50,
    completion_percentage: 47,
    efficiency_percentage: 88,
    yield_percentage: 93.33,
    estimated_hours: 240,
    actual_hours: 130,
    setup_time_hours: 6,
    run_time_hours: 120,
    downtime_hours: 4,
    supervisor: 'Lisa Anderson',
    supervisor_id: 'emp-005',
    assigned_team: ['Electronics Team'],
    operators: ['Operator 8', 'Operator 9'],
    quality_check_required: true,
    quality_status: 'PASSED',
    inspected_by: 'QC Inspector - David Chen',
    inspection_date: '2025-01-18',
    inspection_notes: '14 units passed inspection, 1 unit scrapped due to component failure',
    raw_materials_allocated: true,
    raw_materials_issued: true,
    tools_allocated: true,
    customer_name: 'Global Manufacturing Co',
    customer_id: 'CUST-004',
    project_id: 'PROJ-2025-004',
    department: 'Production',
    description: 'Urgent production order for control panels',
    notes: 'Customer requires expedited delivery',
    special_instructions: 'Test all electronic components before assembly',
    tags: ['electronics', 'control-panel', 'urgent', 'assembly'],
    created_at: '2025-01-10'
  }
];

function nextId() {
  return `mo-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProductionOrders(): Promise<ProductionOrder[]> {
  if (useStatic) return mockProductionOrders;

  try {
    const { data, error } = await supabase.from('production_orders').select('*');
    if (error) throw error;
    return (data as ProductionOrder[]) ?? [];
  } catch (error) {
    handleApiError('manufacturing.listProductionOrders', error);
    useStatic = true;
    return mockProductionOrders;
  }
}

export async function createProductionOrder(
  payload: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductionOrder> {
  if (useStatic) {
    const order: ProductionOrder = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockProductionOrders.unshift(order);
    return order;
  }

  try {
    const { data, error } = await supabase
      .from('production_orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ProductionOrder;
  } catch (error) {
    handleApiError('manufacturing.createProductionOrder', error);
    useStatic = true;
    return createProductionOrder(payload);
  }
}

export async function updateProductionOrder(
  id: string,
  changes: Partial<ProductionOrder>
): Promise<ProductionOrder | null> {
  if (useStatic) {
    const index = mockProductionOrders.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProductionOrders[index] = { ...mockProductionOrders[index], ...changes };
    return mockProductionOrders[index];
  }

  try {
    const { data, error } = await supabase
      .from('production_orders')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductionOrder;
  } catch (error) {
    handleApiError('manufacturing.updateProductionOrder', error);
    useStatic = true;
    return updateProductionOrder(id, changes);
  }
}

export async function deleteProductionOrder(id: string): Promise<void> {
  if (useStatic) {
    const index = mockProductionOrders.findIndex((p) => p.id === id);
    if (index !== -1) mockProductionOrders.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('production_orders').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('manufacturing.deleteProductionOrder', error);
    useStatic = true;
    await deleteProductionOrder(id);
  }
}

