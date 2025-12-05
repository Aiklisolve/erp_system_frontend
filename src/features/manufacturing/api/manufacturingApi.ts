import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { ProductionOrder } from '../types';

let useStatic = !hasSupabaseConfig;

// Backend API flag - set to true to use backend API
const USE_BACKEND_API = true;

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

// Map backend production order to frontend format
function mapBackendProductionOrder(backendPO: any): ProductionOrder {
  // Handle different ID field names from backend
  const poId = backendPO.id?.toString() || 
                backendPO.production_order_id?.toString() || 
                backendPO.mo_id?.toString();
  
  console.log('🔄 Mapping production order:', {
    backend_id: backendPO.id,
    backend_fields: Object.keys(backendPO),
    mapped_id: poId,
    po_number: backendPO.po_number,
    raw_data: backendPO
  });
  
  // Calculate pending quantity if not provided
  // Backend uses: quantity_to_produce, quantity_produced
  const plannedQty = parseInt(backendPO.quantity_to_produce || backendPO.planned_qty || backendPO.planned_quantity) || 0;
  const producedQty = parseInt(backendPO.quantity_produced || backendPO.produced_qty || backendPO.produced_quantity) || 0;
  const pendingQty = backendPO.pending_qty ? parseInt(backendPO.pending_qty) : (plannedQty - producedQty);
  
  // Calculate progress percentage if not provided
  const progressPercentage = backendPO.progress_percentage 
    ? parseFloat(backendPO.progress_percentage)
    : plannedQty > 0 ? (producedQty / plannedQty) * 100 : 0;
  
  return {
    id: poId,
    
    // Production Order Identification - YOUR BACKEND USES: po_number
    production_order_number: backendPO.po_number ||              // ← YOUR BACKEND FIELD
                             backendPO.production_order_number || 
                             backendPO.mo_number || 
                             backendPO.order_number || 
                             `MO-${poId}`,  // Fallback with ID
    work_order_number: backendPO.work_order_number || backendPO.wo_number || backendPO.wo_id,
    reference_number: backendPO.reference_number || backendPO.ref_number,
    sales_order_number: backendPO.sales_order_number || backendPO.so_number,
    
    // Product Information - YOUR BACKEND ONLY HAS: product_id (no product_name)
    // We need to show something meaningful, so use po_number + product_id
    product: backendPO.product_name || 
             backendPO.product || 
             backendPO.item_name || 
             (backendPO.product_id ? `Product ID: ${backendPO.product_id}` : 
              backendPO.po_number || 'Unknown Product'),
    product_code: backendPO.product_code || backendPO.item_code || backendPO.sku,
    product_id: (backendPO.product_id || backendPO.item_id)?.toString(),
    product_description: backendPO.product_description || backendPO.description || backendPO.notes,
    bom_number: backendPO.bom_number || backendPO.bom_id,
    bom_version: backendPO.bom_version,
    
    // Quantity & Units - YOUR BACKEND USES: quantity_to_produce, quantity_produced
    planned_qty: plannedQty,
    produced_qty: producedQty,
    good_qty: parseInt(backendPO.good_qty || backendPO.accepted_qty || backendPO.quality_passed) || 0,
    scrap_qty: parseInt(backendPO.scrap_qty || backendPO.rejected_qty || backendPO.quality_failed) || 0,
    rework_qty: parseInt(backendPO.rework_qty) || 0,
    pending_qty: pendingQty,
    unit: backendPO.unit || backendPO.uom || 'Units',
    
    // Dates - YOUR BACKEND USES: start_date, expected_completion_date, actual_completion_date
    start_date: backendPO.start_date || backendPO.planned_start_date
      ? new Date(backendPO.start_date || backendPO.planned_start_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    end_date: backendPO.expected_completion_date || backendPO.end_date || backendPO.planned_end_date
      ? new Date(backendPO.expected_completion_date || backendPO.end_date || backendPO.planned_end_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    planned_start_date: backendPO.start_date || backendPO.planned_start_date 
      ? new Date(backendPO.start_date || backendPO.planned_start_date).toISOString().split('T')[0] 
      : undefined,
    planned_end_date: backendPO.expected_completion_date || backendPO.planned_end_date 
      ? new Date(backendPO.expected_completion_date || backendPO.planned_end_date).toISOString().split('T')[0] 
      : undefined,
    actual_start_date: backendPO.actual_start_date || backendPO.start_date
      ? new Date(backendPO.actual_start_date || backendPO.start_date).toISOString().split('T')[0] 
      : undefined,
    actual_end_date: backendPO.actual_completion_date || backendPO.actual_end_date || backendPO.completion_date
      ? new Date(backendPO.actual_completion_date || backendPO.actual_end_date || backendPO.completion_date).toISOString().split('T')[0] 
      : undefined,
    
    // Status & Priority - normalize to uppercase
    status: (backendPO.status?.toUpperCase() || 'DRAFT') as any,
    priority: (backendPO.priority?.toUpperCase() || 'MEDIUM') as any,
    production_type: (backendPO.production_type?.toUpperCase() || 
                     backendPO.type?.toUpperCase() || 
                     'MAKE_TO_STOCK') as any,
    
    // Cost & Financial - handle multiple field names
    estimated_cost: parseFloat(backendPO.estimated_cost || backendPO.planned_cost) || 0,
    actual_cost: parseFloat(backendPO.actual_cost || backendPO.total_actual_cost) || 0,
    material_cost: parseFloat(backendPO.material_cost || backendPO.materials_cost) || 0,
    labor_cost: parseFloat(backendPO.labor_cost || backendPO.labour_cost) || 0,
    overhead_cost: parseFloat(backendPO.overhead_cost || backendPO.overheads) || 0,
    cost: parseFloat(backendPO.cost || backendPO.total_cost || backendPO.estimated_cost) || 0,
    currency: (backendPO.currency || 'INR') as any,
    
    // Production Details - YOUR BACKEND HAS: production_line, shift
    batch_number: backendPO.batch_number || backendPO.batch_no || backendPO.batch_id,
    lot_number: backendPO.lot_number || backendPO.lot_no || backendPO.lot_id,
    shift: backendPO.shift || backendPO.shift_name,  // YOUR BACKEND: shift (e.g., "DAY")
    production_line: backendPO.production_line || backendPO.line || backendPO.line_name,  // YOUR BACKEND: production_line
    work_center: backendPO.work_center || backendPO.workcenter || backendPO.work_station,
    machine_id: backendPO.machine_id || backendPO.machine,
    
    // Progress & Efficiency
    progress_percentage: progressPercentage,
    completion_percentage: parseFloat(backendPO.completion_percentage || backendPO.completion) || progressPercentage,
    efficiency_percentage: parseFloat(backendPO.efficiency_percentage || backendPO.efficiency) || undefined,
    yield_percentage: parseFloat(backendPO.yield_percentage || backendPO.yield) || undefined,
    
    // Time Tracking
    estimated_hours: parseFloat(backendPO.estimated_hours || backendPO.planned_hours) || undefined,
    actual_hours: parseFloat(backendPO.actual_hours || backendPO.total_hours) || undefined,
    setup_time_hours: parseFloat(backendPO.setup_time_hours || backendPO.setup_time) || undefined,
    run_time_hours: parseFloat(backendPO.run_time_hours || backendPO.runtime) || undefined,
    downtime_hours: parseFloat(backendPO.downtime_hours || backendPO.downtime) || undefined,
    
    // People & Team - YOUR BACKEND HAS: supervisor_id
    supervisor: backendPO.supervisor_name || backendPO.supervisor || 
                (backendPO.supervisor_id ? `Supervisor ID: ${backendPO.supervisor_id}` : undefined),
    supervisor_id: backendPO.supervisor_id?.toString(),  // YOUR BACKEND: supervisor_id
    assigned_team: Array.isArray(backendPO.assigned_team) ? backendPO.assigned_team : 
                   backendPO.team ? [backendPO.team] : [],
    operators: Array.isArray(backendPO.operators) ? backendPO.operators : 
              backendPO.operator ? [backendPO.operator] : [],
    
    // Quality - YOUR BACKEND HAS: quality_status (e.g., "OK")
    quality_check_required: backendPO.quality_check_required === true || 
                           backendPO.qc_required === true || 
                           backendPO.quality_status !== null,  // If quality_status exists, check is required
    quality_status: (backendPO.quality_status || backendPO.qc_status) as any,  // YOUR BACKEND: quality_status
    inspected_by: backendPO.inspected_by || backendPO.inspector || backendPO.qc_inspector,
    inspection_date: backendPO.inspection_date || backendPO.qc_date,
    inspection_notes: backendPO.inspection_notes || backendPO.qc_notes,
    
    // Materials & Resources
    raw_materials_allocated: backendPO.raw_materials_allocated === true || 
                            backendPO.materials_allocated === true || 
                            false,
    raw_materials_issued: backendPO.raw_materials_issued === true || 
                         backendPO.materials_issued === true || 
                         false,
    tools_allocated: backendPO.tools_allocated === true || false,
    
    // Customer & Project
    customer_name: backendPO.customer_name || backendPO.customer,
    customer_id: (backendPO.customer_id || backendPO.client_id)?.toString(),
    project_id: (backendPO.project_id || backendPO.proj_id)?.toString(),
    department: backendPO.department || backendPO.dept,
    
    // Additional Details
    description: backendPO.description || backendPO.desc || backendPO.notes,
    notes: backendPO.notes || backendPO.remarks,
    special_instructions: backendPO.special_instructions || backendPO.instructions,
    tags: Array.isArray(backendPO.tags) ? backendPO.tags : [],
    
    // Timestamps
    created_at: backendPO.created_at || backendPO.createdAt,
  };
}

export async function listProductionOrders(): Promise<ProductionOrder[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching production orders from backend API...');
      const response = await apiRequest<{ success: boolean; data: { production_orders: any[] } } | { production_orders: any[] } | any[]>(
        '/manufacturing/production-orders?page=1&limit=100'
      );
      
      console.log('📦 Backend production orders response:', response);
      
      // Handle different response formats
      let productionOrders = null;
      
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.production_orders) {
          productionOrders = response.data.production_orders;
        } else if ('production_orders' in response) {
          productionOrders = response.production_orders;
        } else if (Array.isArray(response)) {
          productionOrders = response;
        }
      }
      
      if (productionOrders && Array.isArray(productionOrders) && productionOrders.length > 0) {
        const mapped = productionOrders.map(mapBackendProductionOrder);
        console.log('✅ Mapped production orders:', mapped.length);
        return mapped;
      }
      
      console.log('⚠️ No production orders in response, using mock data');
      return mockProductionOrders;
    } catch (error) {
      console.error('❌ Backend API error, falling back to mock data:', error);
      return mockProductionOrders;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating production order via backend API...');
      
      // Send ONLY fields that backend API accepts (matching curl example exactly)
      const backendPayload: any = {
        production_order_number: payload.production_order_number,
        planned_qty: payload.planned_qty,
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: payload.status,
        priority: payload.priority,
        notes: payload.notes || undefined,
      };
      
      // Only include product_id if provided (convert to number)
      if (payload.product_id && payload.product_id.toString().trim() !== '') {
        backendPayload.product_id = parseInt(payload.product_id.toString());
      }
      
      // Only include production_line if provided
      if (payload.production_line && payload.production_line.trim() !== '') {
        backendPayload.production_line = payload.production_line;
      }
      
      // Only include shift if provided
      if (payload.shift && payload.shift.trim() !== '') {
        backendPayload.shift = payload.shift;
      }
      
      // Only include supervisor_id if provided (convert to number)
      if (payload.supervisor_id && payload.supervisor_id.toString().trim() !== '') {
        backendPayload.supervisor_id = parseInt(payload.supervisor_id.toString());
      }
      
      // Only include quality_status if provided
      if (payload.quality_status) {
        backendPayload.quality_status = payload.quality_status;
      }
      
      console.log('📤 Backend payload (exact match to curl):', JSON.stringify(backendPayload, null, 2));
      
      const response = await apiRequest<{ success: boolean; data: any }>(
        '/manufacturing/production-orders',
        {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        }
      );
      
      console.log('✅ Created production order response:', response);
      
      if (response.success && response.data) {
        return mapBackendProductionOrder(response.data);
      }
      
      throw new Error('Failed to create production order');
    } catch (error) {
      console.error('❌ Error creating production order:', error);
      handleApiError('manufacturing.createProductionOrder', error);
      throw error;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating production order via backend API:', id);
      
      const backendChanges: any = {};
      if (changes.production_order_number) backendChanges.production_order_number = changes.production_order_number;
      if (changes.product) backendChanges.product_name = changes.product;
      if (changes.status) backendChanges.status = changes.status;
      if (changes.priority) backendChanges.priority = changes.priority;
      if (changes.planned_qty !== undefined) backendChanges.planned_qty = changes.planned_qty;
      if (changes.produced_qty !== undefined) backendChanges.produced_qty = changes.produced_qty;
      if (changes.start_date) backendChanges.start_date = changes.start_date;
      if (changes.end_date) backendChanges.end_date = changes.end_date;
      if (changes.cost !== undefined) backendChanges.cost = changes.cost;
      if (changes.notes) backendChanges.notes = changes.notes;
      
      const response = await apiRequest<{ success: boolean; data: any }>(
        `/manufacturing/production-orders/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(backendChanges),
        }
      );
      
      console.log('✅ Updated production order response:', response);
      
      if (response.success && response.data) {
        return mapBackendProductionOrder(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error updating production order:', error);
      handleApiError('manufacturing.updateProductionOrder', error);
      return null;
    }
  }
  
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
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting production order via backend API:', id);
      
      const response = await apiRequest<{ success: boolean; message?: string }>(
        `/manufacturing/production-orders/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('✅ Deleted production order response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete production order');
      }
    } catch (error) {
      console.error('❌ Error deleting production order:', error);
      handleApiError('manufacturing.deleteProductionOrder', error);
      throw error;
    }
    return;
  }
  
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

// ============================================
// PRODUCTS API (for Product ID dropdown)
// ============================================

export interface Product {
  id: number;
  product_id?: number;
  product_name: string;
  product_code?: string;
  name?: string;
  code?: string;
}

export async function listProducts(): Promise<Product[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching products from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { products: any[] } } | { products: any[] } | any[]>(
        '/products?page=1&limit=1000'
      );
      
      console.log('📦 Backend products response:', response);
      
      // Handle different response formats
      let products = null;
      
      if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response && response.data.products) {
          products = response.data.products;
        }
        // If direct products array
        else if ('products' in response) {
          products = response.products;
        }
        // If direct array
        else if (Array.isArray(response)) {
          products = response;
        }
      }
      
      if (products && Array.isArray(products) && products.length > 0) {
        const mapped = products.map((p: any) => ({
          id: parseInt(p.id || p.product_id) || 0,
          product_id: parseInt(p.id || p.product_id) || 0,
          product_name: p.product_name || p.name || p.product || 'Unknown Product',
          product_code: p.product_code || p.code || '',
          name: p.product_name || p.name || p.product || 'Unknown Product',
          code: p.product_code || p.code || '',
        }));
        console.log('✅ Mapped products:', mapped.length);
        return mapped;
      }
      
      console.log('⚠️ No products in response');
      return [];
    } catch (error) {
      console.error('❌ Backend API error fetching products:', error);
      return [];
    }
  }
  
  // Fallback to empty array if backend API is not available
  return [];
}

// ============================================
// USERS API (for Supervisor ID dropdown)
// ============================================

export interface User {
  id: number;
  user_id?: number;
  name: string;
  full_name?: string;
  email?: string;
  employee_id?: number;
}

export async function listUsers(): Promise<User[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching users from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { users: any[] } } | { users: any[] } | any[]>(
        '/users?page=1&limit=1000'
      );
      
      console.log('👥 Backend users response:', response);
      
      // Handle different response formats
      let users = null;
      
      if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response && response.data.users) {
          users = response.data.users;
        }
        // If direct users array
        else if ('users' in response) {
          users = response.users;
        }
        // If direct array
        else if (Array.isArray(response)) {
          users = response;
        }
      }
      
      if (users && Array.isArray(users) && users.length > 0) {
        const mapped = users.map((u: any) => ({
          id: parseInt(u.id || u.user_id || u.employee_id) || 0,
          user_id: parseInt(u.id || u.user_id || u.employee_id) || 0,
          name: u.name || u.full_name || (u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : '') || u.email || 'Unknown User',
          full_name: u.name || u.full_name || (u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : '') || u.email || 'Unknown User',
          email: u.email || '',
          employee_id: parseInt(u.id || u.user_id || u.employee_id) || 0,
        }));
        console.log('✅ Mapped users:', mapped.length);
        return mapped;
      }
      
      console.log('⚠️ No users in response');
      return [];
    } catch (error) {
      console.error('❌ Backend API error fetching users:', error);
      return [];
    }
  }
  
  // Fallback to empty array if backend API is not available
  return [];
}

