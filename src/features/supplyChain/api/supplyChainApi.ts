import { supabase, hasSupabaseConfig } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';
import type { Supplier } from '../types';

let useStatic = !hasSupabaseConfig;

const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    supplier_code: 'SUP-2025-ABC123',
    name: 'Acme Components',
    legal_name: 'Acme Components Inc.',
    tax_id: 'TAX-123456789',
    registration_number: 'REG-001',
    contact_person: 'Sarah Johnson',
    phone: '+1 555-0101',
    email: 'sarah@acmecomponents.com',
    website: 'https://acmecomponents.com',
    address: '123 Industrial Park',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    category: 'MANUFACTURER',
    status: 'ACTIVE',
    rating: 4.6,
    payment_terms: 'NET_30',
    credit_limit: 50000,
    currency: 'USD',
    tax_rate: 8.5,
    on_time_delivery_rate: 96.5,
    quality_score: 4.7,
    lead_time_days: 7,
    total_orders: 45,
    total_spend: 125000,
    last_order_date: '2025-01-05',
    risk_level: 'LOW',
    compliance_status: 'COMPLIANT',
    certifications: ['ISO 9001', 'ISO 14001'],
    insurance_expiry: '2025-12-31',
    contract_start_date: '2024-01-01',
    contract_end_date: '2025-12-31',
    contract_value: 200000,
    contract_type: 'ANNUAL',
    account_manager: 'John Smith',
    procurement_officer: 'Jane Doe',
    notes: 'Preferred supplier for electronic components',
    created_at: '2025-01-01'
  },
  {
    id: 'sup-2',
    supplier_code: 'SUP-2025-XYZ789',
    name: 'Global Logistics',
    legal_name: 'Global Logistics Ltd.',
    tax_id: 'TAX-987654321',
    contact_person: 'Michael Chen',
    phone: '+1 555-2300',
    email: 'michael@globallogistics.com',
    website: 'https://globallogistics.com',
    address: '456 Shipping Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90001',
    country: 'USA',
    category: 'DISTRIBUTOR',
    status: 'ACTIVE',
    rating: 4.2,
    payment_terms: 'NET_15',
    credit_limit: 30000,
    currency: 'USD',
    tax_rate: 9.0,
    on_time_delivery_rate: 92.0,
    quality_score: 4.3,
    lead_time_days: 5,
    total_orders: 32,
    total_spend: 85000,
    last_order_date: '2025-01-06',
    risk_level: 'MEDIUM',
    compliance_status: 'COMPLIANT',
    certifications: ['ISO 9001'],
    account_manager: 'Sarah Wilson',
    procurement_officer: 'Mike Johnson',
    notes: 'Reliable logistics partner',
    created_at: '2025-01-03'
  },
  {
    id: 'sup-3',
    supplier_code: 'SUP-2025-DEF456',
    name: 'Premium Parts Supplier',
    legal_name: 'Premium Parts Supplier Co.',
    contact_person: 'Robert Brown',
    phone: '+1 555-4567',
    email: 'robert@premiumparts.com',
    category: 'WHOLESALER',
    status: 'SUSPENDED',
    rating: 3.2,
    payment_terms: 'NET_60',
    credit_limit: 20000,
    currency: 'USD',
    on_time_delivery_rate: 78.5,
    quality_score: 3.5,
    lead_time_days: 14,
    total_orders: 12,
    total_spend: 25000,
    last_order_date: '2024-12-15',
    risk_level: 'HIGH',
    compliance_status: 'PENDING_REVIEW',
    account_manager: 'Lisa Anderson',
    notes: 'Suspended due to quality issues',
    created_at: '2024-11-01'
  }
];

function nextId() {
  return `sup-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSuppliers(): Promise<Supplier[]> {
  if (useStatic) return mockSuppliers;

  try {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw error;
    return (data as Supplier[]) ?? [];
  } catch (error) {
    handleApiError('supplyChain.listSuppliers', error);
    useStatic = true;
    return mockSuppliers;
  }
}

export async function createSupplier(
  payload: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
): Promise<Supplier> {
  if (useStatic) {
    const supplier: Supplier = {
      ...payload,
      id: nextId(),
      created_at: new Date().toISOString()
    };
    mockSuppliers.unshift(supplier);
    return supplier;
  }

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  } catch (error) {
    handleApiError('supplyChain.createSupplier', error);
    useStatic = true;
    return createSupplier(payload);
  }
}

export async function updateSupplier(
  id: string,
  changes: Partial<Supplier>
): Promise<Supplier | null> {
  if (useStatic) {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    mockSuppliers[index] = { ...mockSuppliers[index], ...changes };
    return mockSuppliers[index];
  }

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  } catch (error) {
    handleApiError('supplyChain.updateSupplier', error);
    useStatic = true;
    return updateSupplier(id, changes);
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  if (useStatic) {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index !== -1) mockSuppliers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleApiError('supplyChain.deleteSupplier', error);
    useStatic = true;
    await deleteSupplier(id);
  }
}


