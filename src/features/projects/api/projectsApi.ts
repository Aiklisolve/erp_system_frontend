import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import { apiRequest } from '../../../config/api';
import type { Project } from '../types';

// Toggle to use backend API
const USE_BACKEND_API = true;
let useStatic = !hasSupabaseConfig && !USE_BACKEND_API;

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    project_code: 'PROJ-2025-ERP001',
    name: 'Manufacturing ERP System Implementation',
    description: 'Complete Manufacturing ERP system implementation including Manufacturing, Production Planning, Shop Floor Management, Quality Control, and Inventory modules',
    client: 'Acme Manufacturing Corporation',
    client_id: 'crm-001',
    client_contact_person: 'John Smith',
    client_email: 'john.smith@acmemfg.com',
    client_phone: '+1 555-0101',
    project_type: 'IMPLEMENTATION',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    phase: 'EXECUTION',
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    planned_start_date: '2025-01-01',
    planned_end_date: '2025-06-30',
    actual_start_date: '2025-01-02',
    budget: 125000,
    estimated_budget: 120000,
    actual_cost: 78500,
    remaining_budget: 46500,
    revenue: 125000,
    profit: 46500,
    profit_margin: 37.2,
    currency: 'USD',
    billing_type: 'FIXED',
    invoiced_amount: 62500,
    paid_amount: 50000,
    outstanding_amount: 12500,
    payment_terms: 'Net 30',
    project_manager: 'Sarah Johnson',
    assigned_team: ['Manufacturing Implementation Team', 'Production Team', 'QA Team'],
    team_members: ['Mike Wilson', 'Lisa Anderson', 'Tom Brown'],
    resource_allocation: 75,
    progress_percentage: 62,
    completion_percentage: 60,
    tasks_completed: 31,
    tasks_total: 50,
    estimated_hours: 2000,
    logged_hours: 1240,
    remaining_hours: 760,
    deliverables: ['Phase 1: Manufacturing Module', 'Phase 2: Production Planning & Scheduling', 'Phase 3: Shop Floor Management', 'Phase 4: Quality Control System', 'Phase 5: Inventory Integration', 'Production Staff Training', 'Documentation'],
    deliverables_completed: 2,
    risk_level: 'MEDIUM',
    issues_count: 3,
    risks_count: 2,
    quality_score: 4.5,
    client_satisfaction: 4.3,
    performance_rating: 4.4,
    project_scope: 'Full Manufacturing ERP implementation including Manufacturing module, Production Planning, Work Orders, Shop Floor Management, Quality Control, BOM Management, and Inventory integration',
    objectives: ['Implement Manufacturing module', 'Setup production planning system', 'Configure shop floor management', 'Integrate quality control', 'Train production staff', 'Achieve 95% user adoption'],
    success_criteria: ['Manufacturing module deployed', 'Production planning operational', 'Shop floor tracking active', 'Quality control integrated', 'Production training completed', 'System performance meets SLA'],
    location: 'New York Manufacturing Plant',
    work_location: 'ONSITE',
    contract_number: 'CNT-2025-001',
    contract_start_date: '2025-01-01',
    contract_end_date: '2025-06-30',
    contract_value: 125000,
    tags: ['ERP', 'Manufacturing', 'Production', 'Shop Floor', 'Implementation', 'High Priority'],
    notes: 'Project progressing well, Manufacturing module in progress, minor delays in Shop Floor configuration',
    created_at: '2024-12-10'
  },
  {
    id: 'proj-2',
    project_code: 'PROJ-2025-ERP002',
    name: 'Manufacturing Module Implementation & Production Planning',
    description: 'Implement ERP Manufacturing module with production planning, scheduling, work orders, and shop floor management system',
    client: 'Industrial Manufacturing Inc',
    client_id: 'crm-002',
    client_contact_person: 'Emily Davis',
    client_email: 'emily.davis@industrialmfg.com',
    client_phone: '+1 555-0202',
    project_type: 'IMPLEMENTATION',
    status: 'PLANNING',
    priority: 'HIGH',
    phase: 'PLANNING',
    start_date: '2025-02-01',
    end_date: '2025-08-31',
    planned_start_date: '2025-02-01',
    planned_end_date: '2025-08-31',
    budget: 85000,
    estimated_budget: 90000,
    actual_cost: 5000,
    remaining_budget: 80000,
    currency: 'USD',
    billing_type: 'TIME_MATERIALS',
    hourly_rate: 150,
    billing_rate: 150,
    billable_hours: 33,
    invoiced_amount: 4950,
    paid_amount: 4950,
    outstanding_amount: 0,
    payment_terms: 'Net 15',
    project_manager: 'Mike Wilson',
    assigned_team: ['Manufacturing Team', 'Production Planning Team'],
    team_members: ['Alex Rivera', 'Jordan Lee', 'Sarah Johnson'],
    resource_allocation: 50,
    progress_percentage: 5,
    completion_percentage: 5,
    tasks_completed: 3,
    tasks_total: 45,
    estimated_hours: 1500,
    logged_hours: 33,
    remaining_hours: 1467,
    deliverables: ['Manufacturing Module Setup', 'Production Planning System', 'Work Order Management', 'Shop Floor Control', 'BOM Configuration', 'Production Reports', 'User Training'],
    deliverables_completed: 0,
    risk_level: 'MEDIUM',
    issues_count: 0,
    risks_count: 2,
    project_scope: 'Implement complete Manufacturing module including production planning, work orders, shop floor management, BOM management, and production tracking',
    objectives: ['Setup manufacturing module', 'Configure production planning', 'Implement work order system', 'Setup shop floor tracking', 'Train production staff'],
    success_criteria: ['Manufacturing module deployed', 'Production planning operational', 'Work orders processing', 'Shop floor tracking active', 'Training completed'],
    location: 'Chicago Manufacturing Plant',
    work_location: 'ONSITE',
    contract_number: 'CNT-2025-002',
    contract_start_date: '2025-02-01',
    contract_end_date: '2025-08-31',
    contract_value: 85000,
    tags: ['ERP', 'Manufacturing', 'Production', 'Work Orders', 'Shop Floor'],
    notes: 'Planning phase in progress, reviewing current manufacturing processes',
    created_at: '2024-12-15'
  },
  {
    id: 'proj-3',
    project_code: 'PROJ-2024-ERP003',
    name: 'Manufacturing Workflow Customization & Production Automation',
    description: 'Customize Manufacturing module with automated production workflows, custom production reports, and shop floor automation',
    client: 'Precision Manufacturing Corp',
    client_id: 'crm-003',
    client_contact_person: 'Robert Chen',
    client_email: 'robert.chen@precisionmfg.com',
    client_phone: '+1 555-0303',
    project_type: 'CONSULTING',
    status: 'COMPLETED',
    priority: 'HIGH',
    phase: 'CLOSURE',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
    planned_start_date: '2024-09-01',
    planned_end_date: '2024-12-15',
    actual_start_date: '2024-09-01',
    actual_end_date: '2024-12-18',
    budget: 95000,
    estimated_budget: 100000,
    actual_cost: 92000,
    remaining_budget: 3000,
    revenue: 95000,
    profit: 3000,
    profit_margin: 3.16,
    currency: 'USD',
    billing_type: 'MILESTONE',
    invoiced_amount: 95000,
    paid_amount: 95000,
    outstanding_amount: 0,
    payment_terms: 'Milestone-based',
    project_manager: 'Lisa Anderson',
    assigned_team: ['Manufacturing Customization Team', 'Production Team'],
    team_members: ['Sarah Johnson', 'Mike Wilson', 'Tom Brown'],
    resource_allocation: 80,
    progress_percentage: 100,
    completion_percentage: 100,
    tasks_completed: 52,
    tasks_total: 52,
    estimated_hours: 1800,
    logged_hours: 1750,
    remaining_hours: 50,
    deliverables: ['Custom Production Workflows', 'Automated Work Order Processing', 'Shop Floor Automation', 'Production Analytics Dashboard', 'Quality Control Reports', 'User Training', 'Documentation'],
    deliverables_completed: 7,
    risk_level: 'LOW',
    issues_count: 0,
    risks_count: 0,
    quality_score: 4.8,
    client_satisfaction: 4.9,
    performance_rating: 4.85,
    project_scope: 'Customize ERP Manufacturing module with automated production workflows, custom production reporting, shop floor automation, and advanced production analytics',
    objectives: ['Implement custom production workflows', 'Automate work order processing', 'Setup shop floor automation', 'Create production analytics dashboard', 'Train production staff', 'Achieve 95% user adoption'],
    success_criteria: ['All customizations deployed', 'Production workflows operational', 'Shop floor automation active', 'User training completed', 'Client satisfaction achieved'],
    location: 'Detroit Manufacturing Plant',
    work_location: 'ONSITE',
    contract_number: 'CNT-2024-003',
    contract_start_date: '2024-09-01',
    contract_end_date: '2024-12-31',
    contract_value: 95000,
    tags: ['ERP', 'Manufacturing', 'Production', 'Automation', 'Workflow', 'Completed'],
    notes: 'Successfully completed, client very satisfied with production automation and shop floor management',
    created_at: '2024-08-20'
  },
  {
    id: 'proj-4',
    project_code: 'PROJ-2025-ERP004',
    name: 'ERP Support & Maintenance',
    description: 'Ongoing support and maintenance for existing ERP system including bug fixes, feature updates, and system monitoring',
    client: 'Global Manufacturing Co',
    client_id: 'crm-004',
    client_contact_person: 'Maria Garcia',
    client_email: 'maria.garcia@globalmfg.com',
    client_phone: '+1 555-0404',
    project_type: 'SUPPORT',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    phase: 'MONITORING',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    planned_start_date: '2025-01-01',
    planned_end_date: '2025-12-31',
    budget: 60000,
    estimated_budget: 60000,
    actual_cost: 18500,
    remaining_budget: 41500,
    currency: 'USD',
    billing_type: 'MONTHLY',
    hourly_rate: 100,
    billing_rate: 100,
    billable_hours: 185,
    invoiced_amount: 18500,
    paid_amount: 18500,
    outstanding_amount: 0,
    payment_terms: 'Monthly',
    project_manager: 'Tom Brown',
    assigned_team: ['ERP Support Team'],
    team_members: ['Support Agent 1', 'Support Agent 2', 'Technical Specialist'],
    resource_allocation: 25,
    progress_percentage: 15,
    completion_percentage: 15,
    tasks_completed: 12,
    tasks_total: 80,
    estimated_hours: 600,
    logged_hours: 185,
    remaining_hours: 415,
    deliverables: ['Monthly ERP Reports', 'Bug Fixes & Patches', 'Module Updates', 'System Performance Monitoring', 'User Support'],
    deliverables_completed: 1,
    risk_level: 'LOW',
    issues_count: 2,
    risks_count: 0,
    quality_score: 4.6,
    client_satisfaction: 4.5,
    performance_rating: 4.55,
    project_scope: 'Provide ongoing support, maintenance, and updates for ERP system including Finance, Inventory, Manufacturing, and Warehouse modules',
    objectives: ['Maintain 99.9% system uptime', 'Resolve issues within SLA', 'Provide regular module updates', 'Ensure data integrity'],
    success_criteria: ['System uptime maintained', 'All tickets resolved on time', 'Monthly reports delivered', 'Client satisfaction maintained'],
    location: 'Remote',
    work_location: 'REMOTE',
    contract_number: 'CNT-2025-004',
    contract_start_date: '2025-01-01',
    contract_end_date: '2025-12-31',
    contract_value: 60000,
    tags: ['ERP', 'Support', 'Maintenance', 'Ongoing'],
    notes: 'ERP support contract, monthly billing, covering all 13 modules',
    created_at: '2024-12-20'
  },
  {
    id: 'proj-5',
    project_code: 'PROJ-2025-ERP005',
    name: 'Manufacturing ERP Data Migration & Production System Upgrade',
    description: 'Migrate manufacturing data from legacy ERP system and upgrade to latest ERP version with enhanced production planning and shop floor features',
    client: 'Automotive Parts Manufacturing',
    client_id: 'crm-005',
    client_contact_person: 'David Kim',
    client_email: 'david.kim@autopartsmfg.com',
    client_phone: '+1 555-0505',
    project_type: 'IMPLEMENTATION',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    phase: 'EXECUTION',
    start_date: '2025-01-15',
    end_date: '2025-05-30',
    planned_start_date: '2025-01-15',
    planned_end_date: '2025-05-30',
    actual_start_date: '2025-01-15',
    budget: 150000,
    estimated_budget: 145000,
    actual_cost: 89500,
    remaining_budget: 60500,
    currency: 'USD',
    billing_type: 'MILESTONE',
    hourly_rate: 175,
    billing_rate: 175,
    billable_hours: 511,
    invoiced_amount: 75000,
    paid_amount: 60000,
    outstanding_amount: 15000,
    payment_terms: 'Milestone-based',
    project_manager: 'Sarah Johnson',
    assigned_team: ['Migration Team', 'Manufacturing Team', 'QA Team', 'Training Team'],
    team_members: ['Mike Wilson', 'Lisa Anderson', 'Tom Brown', 'Alex Rivera'],
    resource_allocation: 90,
    progress_percentage: 58,
    completion_percentage: 55,
    tasks_completed: 29,
    tasks_total: 50,
    estimated_hours: 2500,
    logged_hours: 1450,
    remaining_hours: 1050,
    deliverables: ['Manufacturing Data Migration Plan', 'BOM Data Extraction', 'Production Order Migration', 'Work Order Data Migration', 'Shop Floor Data Import', 'System Upgrade', 'Production Staff Training', 'Go-Live Support'],
    deliverables_completed: 3,
    risk_level: 'HIGH',
    issues_count: 5,
    risks_count: 3,
    quality_score: 4.2,
    client_satisfaction: 4.0,
    performance_rating: 4.1,
    project_scope: 'Migrate all manufacturing data from legacy ERP system (SAP) to new ERP platform including BOMs, production orders, work orders, shop floor data, and manufacturing history',
    objectives: ['Complete manufacturing data migration', 'Upgrade to latest ERP version', 'Ensure zero production data loss', 'Minimize production disruption', 'Train production staff'],
    success_criteria: ['All manufacturing data migrated', 'Production system upgraded', 'Zero data loss', 'Production training completed', 'Go-live successful'],
    location: 'Dallas Manufacturing Plant',
    work_location: 'ONSITE',
    contract_number: 'CNT-2025-005',
    contract_start_date: '2025-01-15',
    contract_end_date: '2025-05-30',
    contract_value: 150000,
    tags: ['ERP', 'Manufacturing', 'Migration', 'Production', 'BOM', 'Critical'],
    notes: 'Critical project, manufacturing data migration in progress, BOM data quality issues being resolved',
    created_at: '2024-12-25'
  },
  {
    id: 'proj-6',
    project_code: 'PROJ-2024-ERP006',
    name: 'ERP Multi-Warehouse Setup & Configuration',
    description: 'Configure and setup multi-warehouse management system with automated inventory transfers and real-time tracking',
    client: 'Distribution Logistics Ltd',
    client_id: 'crm-006',
    client_contact_person: 'Jennifer White',
    client_email: 'jennifer.white@distlogistics.com',
    client_phone: '+1 555-0606',
    project_type: 'IMPLEMENTATION',
    status: 'COMPLETED',
    priority: 'HIGH',
    phase: 'CLOSURE',
    start_date: '2024-10-01',
    end_date: '2024-12-20',
    planned_start_date: '2024-10-01',
    planned_end_date: '2024-12-15',
    actual_start_date: '2024-10-01',
    actual_end_date: '2024-12-18',
    budget: 75000,
    estimated_budget: 80000,
    actual_cost: 73500,
    remaining_budget: 1500,
    revenue: 75000,
    profit: 1500,
    profit_margin: 2.0,
    currency: 'USD',
    billing_type: 'FIXED',
    invoiced_amount: 75000,
    paid_amount: 75000,
    outstanding_amount: 0,
    payment_terms: 'Net 30',
    project_manager: 'Mike Wilson',
    assigned_team: ['Warehouse Team', 'Configuration Team'],
    team_members: ['Lisa Anderson', 'Tom Brown', 'Alex Rivera'],
    resource_allocation: 60,
    progress_percentage: 100,
    completion_percentage: 100,
    tasks_completed: 38,
    tasks_total: 38,
    estimated_hours: 1200,
    logged_hours: 1180,
    remaining_hours: 20,
    deliverables: ['Warehouse Configuration', 'Multi-Location Setup', 'Automated Transfer Rules', 'Real-Time Tracking System', 'Inventory Reports', 'User Training'],
    deliverables_completed: 6,
    risk_level: 'LOW',
    issues_count: 0,
    risks_count: 0,
    quality_score: 4.7,
    client_satisfaction: 4.8,
    performance_rating: 4.75,
    project_scope: 'Setup and configure multi-warehouse management system with 5 warehouse locations, automated inventory transfers, and real-time tracking',
    objectives: ['Configure 5 warehouse locations', 'Setup automated transfer rules', 'Implement real-time tracking', 'Train warehouse staff'],
    success_criteria: ['All warehouses configured', 'Transfer automation working', 'Tracking system operational', 'Training completed'],
    location: 'Atlanta Office',
    work_location: 'ONSITE',
    contract_number: 'CNT-2024-006',
    contract_start_date: '2024-10-01',
    contract_end_date: '2024-12-20',
    contract_value: 75000,
    tags: ['ERP', 'Warehouse', 'Multi-Location', 'Inventory', 'Completed'],
    notes: 'Successfully completed, all warehouses operational, client very satisfied',
    created_at: '2024-09-15'
  }
];

function nextId() {
  return `proj-${Math.random().toString(36).slice(2, 8)}`;
}

// Map backend project response to frontend Project type
function mapBackendProject(backendProject: any): Project {
  return {
    id: String(backendProject.id || backendProject.project_id || ''),
    project_code: backendProject.project_code || backendProject.projectCode || '',
    name: backendProject.name || '',
    description: backendProject.description || '',
    client: backendProject.client || '',
    client_id: backendProject.client_id || backendProject.clientId || '',
    client_contact_person: backendProject.client_contact_person || backendProject.clientContactPerson || '',
    client_email: backendProject.client_email || backendProject.clientEmail || '',
    client_phone: backendProject.client_phone || backendProject.clientPhone || '',
    project_type: backendProject.project_type || backendProject.projectType || 'OTHER',
    status: backendProject.status || 'PLANNING',
    priority: backendProject.priority || undefined,
    start_date: backendProject.start_date || backendProject.startDate || '',
    end_date: backendProject.end_date || backendProject.endDate || undefined,
    budget: Number(backendProject.budget || 0),
    currency: backendProject.currency || 'INR',
    project_manager: backendProject.project_manager || backendProject.projectManager || '',
    project_manager_id: backendProject.project_manager_id || backendProject.projectManagerId || undefined,
    contract_number: backendProject.manager_mobile || backendProject.contract_number || backendProject.contractNumber || '',
    progress_percentage: backendProject.progress_percentage !== undefined && backendProject.progress_percentage !== null 
      ? Number(backendProject.progress_percentage) 
      : undefined,
    created_at: backendProject.created_at || backendProject.createdAt || new Date().toISOString(),
    updated_at: backendProject.updated_at || backendProject.updatedAt || new Date().toISOString(),
  };
}

export async function listProjects(): Promise<Project[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching projects from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { projects: any[]; pagination?: any } } | { projects: any[] } | any[]>(
        '/projects?page=1&limit=1000'
      );

      console.log('📋 Backend projects response:', response);

      // Handle different response formats
      let projects = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.projects) {
          projects = response.data.projects;
        } else if ('projects' in response) {
          projects = response.projects;
        } else if (Array.isArray(response)) {
          projects = response;
        }
      }

      if (projects.length > 0) {
        const mapped = projects.map(mapBackendProject);
        console.log('✅ Mapped projects:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No projects in response, falling back to mock data');
      return mockProjects;
    } catch (error) {
      console.error('❌ Backend API error fetching projects:', error);
      return mockProjects;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) return mockProjects;

  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return (data as Project[]) ?? [];
  } catch (error) {
    handleApiError('projects.listProjects', error);
    useStatic = true;
    return mockProjects;
  }
}

export async function createProject(
  payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating project via backend API...', payload);
      
      const response = await apiRequest<{ success: boolean; data: { project: any } } | { project: any } | any>(
        '/projects',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      console.log('✅ Backend create project response:', response);

      let project = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.project) {
          project = response.data.project;
        } else if ('project' in response) {
          project = response.project;
        } else if (!('success' in response)) {
          project = response;
        }
      }

      if (project) {
        const mapped = mapBackendProject(project);
        console.log('✅ Project created successfully:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error creating project:', error);
      // Fallback to mock
      const project: Project = {
        ...payload,
        id: nextId(),
        created_at: new Date().toISOString()
      };
      mockProjects.unshift(project);
      return project;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const project: Project = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockProjects.unshift(project);
    return project;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  } catch (error) {
    handleApiError('projects.createProject', error);
    useStatic = true;
    return createProject(payload);
  }
}

export async function updateProject(
  id: string,
  changes: Partial<Project>
): Promise<Project | null> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Updating project via backend API...', id, changes);
      
      const response = await apiRequest<{ success: boolean; data: { project: any } } | { project: any } | any>(
        `/projects/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(changes)
        }
      );

      console.log('✅ Backend update project response:', response);

      let project = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.project) {
          project = response.data.project;
        } else if ('project' in response) {
          project = response.project;
        } else if (!('success' in response)) {
          project = response;
        }
      }

      if (project) {
        const mapped = mapBackendProject(project);
        console.log('✅ Project updated successfully:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Backend API error updating project:', error);
      // Fallback to mock
      const index = mockProjects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      mockProjects[index] = { ...mockProjects[index], ...changes };
      return mockProjects[index];
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProjects[index] = { ...mockProjects[index], ...changes };
    return mockProjects[index];
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  } catch (error) {
    handleApiError('projects.updateProject', error);
    useStatic = true;
    return updateProject(id, changes);
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting project via backend API...', id);
      
      await apiRequest(`/projects/${id}`, {
        method: 'DELETE'
      });

      console.log('✅ Project deleted successfully:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting project:', error);
      // Fallback to mock
      const index = mockProjects.findIndex((p) => p.id === id);
      if (index !== -1) mockProjects.splice(index, 1);
      return;
    }
  }

  // Fallback to Supabase or mock
  if (useStatic) {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) mockProjects.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('projects.deleteProject', error);
    useStatic = true;
    await deleteProject(id);
  }
}

// ============================================
// PROJECT MANAGER USERS API
// ============================================

export interface ProjectManagerOption {
  id: string;
  user_id?: string;
  name: string;
  full_name?: string;
  email: string;
  role?: string;
  erp_role?: string;
  username?: string;
}

// Map backend user response to ProjectManagerOption
function mapBackendProjectManager(backendUser: any): ProjectManagerOption {
  const fullName = backendUser.full_name || 
    (backendUser.first_name && backendUser.last_name 
      ? `${backendUser.first_name} ${backendUser.last_name}`.trim()
      : backendUser.name || backendUser.username || 'Unknown User');
  
  return {
    id: backendUser.id?.toString() || backendUser.user_id?.toString() || '',
    user_id: backendUser.user_id?.toString() || backendUser.id?.toString(),
    name: fullName,
    full_name: fullName,
    email: backendUser.email || '',
    role: backendUser.role || backendUser.erp_role,
    erp_role: backendUser.erp_role || backendUser.role,
    username: backendUser.username || backendUser.email,
  };
}

// Roles suitable for project management
const PROJECT_MANAGER_ROLES = [
  'ADMIN',
  'PROJECT_MANAGER',
  'SALES_MANAGER',
  'OPERATIONS',
  'MANAGER',
];

// List users for project manager dropdown (filtered by role)
export async function listProjectManagers(): Promise<ProjectManagerOption[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching project managers from backend API...');
      
      const response = await apiRequest<{ success: boolean; data: { users: any[] } } | { users: any[] } | any[]>(
        '/users?page=1&limit=1000'
      );

      console.log('👥 Backend users response:', response);

      // Handle different response formats
      let users = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.users) {
          users = response.data.users;
        } else if ('users' in response) {
          users = response.users;
        } else if (Array.isArray(response)) {
          users = response;
        }
      }

      if (users.length > 0) {
        // Filter users by project manager roles
        const filteredUsers = users.filter((u: any) => {
          const userRole = (u.role || u.erp_role || '').toString().toUpperCase().trim();
          // Check if role matches any of the project manager roles (exact match or contains)
          return PROJECT_MANAGER_ROLES.some(role => 
            userRole === role || 
            userRole.includes(role) ||
            userRole.includes('PROJECT') ||
            userRole.includes('MANAGER')
          );
        });
        
        const mapped = filteredUsers.map(mapBackendProjectManager);
        console.log('✅ Mapped project managers:', mapped.length);
        console.log('📋 Project manager roles filter:', PROJECT_MANAGER_ROLES);
        return mapped;
      }

      console.log('⚠️ No project managers found in response');
      return [];
    } catch (error) {
      console.error('❌ Backend API error fetching project managers:', error);
      return [];
    }
  }

  return [];
}

