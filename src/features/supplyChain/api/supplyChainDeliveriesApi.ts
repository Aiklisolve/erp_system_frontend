import { apiRequest } from '../../../config/api';
import type { SupplyChainDelivery } from '../types';

// Mock data for fallback (will be replaced with backend integration)
const mockDeliveries: SupplyChainDelivery[] = [];

interface SupplyChainDeliveryListResponse {
  success: boolean;
  data: {
    deliveries: SupplyChainDelivery[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * List all supply chain deliveries
 */
export async function listSupplyChainDeliveries(): Promise<SupplyChainDelivery[]> {
  try {
    const response = await apiRequest<SupplyChainDeliveryListResponse>('/supply-chain/deliveries?limit=1000');
    return response.data.deliveries.map(d => ({ ...d, id: String(d.id) }));
  } catch (error) {
    console.error('Error fetching supply chain deliveries:', error);
    return mockDeliveries;
  }
}

/**
 * Get a single supply chain delivery by ID
 */
export async function getSupplyChainDeliveryById(id: number): Promise<SupplyChainDelivery> {
  try {
    const response = await apiRequest<{ success: boolean; data: SupplyChainDelivery }>(`/supply-chain/deliveries/${id}`);
    return { ...response.data, id: String(response.data.id) };
  } catch (error) {
    console.error('Error fetching supply chain delivery:', error);
    throw error;
  }
}

/**
 * Create a new supply chain delivery
 */
export async function createSupplyChainDelivery(
  payload: Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>
): Promise<SupplyChainDelivery> {
  try {
    const response = await apiRequest<{ success: boolean; data: SupplyChainDelivery }>('/supply-chain/deliveries', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { ...response.data, id: String(response.data.id) };
  } catch (error) {
    console.error('Error creating supply chain delivery:', error);
    throw error;
  }
}

/**
 * Update an existing supply chain delivery
 */
export async function updateSupplyChainDelivery(
  id: number,
  payload: Partial<Omit<SupplyChainDelivery, 'id' | 'created_at' | 'updated_at'>>
): Promise<SupplyChainDelivery> {
  try {
    const response = await apiRequest<{ success: boolean; data: SupplyChainDelivery }>(`/supply-chain/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return { ...response.data, id: String(response.data.id) };
  } catch (error) {
    console.error('Error updating supply chain delivery:', error);
    throw error;
  }
}

/**
 * Delete a supply chain delivery
 */
export async function deleteSupplyChainDelivery(id: number): Promise<void> {
  try {
    await apiRequest(`/supply-chain/deliveries/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting supply chain delivery:', error);
    throw error;
  }
}

