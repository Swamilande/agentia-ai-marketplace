import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('agentia-auth');
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
  }
  return config;
});

// Types
export interface PaymentRequest {
  agent_id: string;
  user_id: string;
  amount: number;
  card_number: string;
  expiry: string;
  cvc: string;
  card_name: string;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id: string;
  agent_server_url: string;
  message: string;
}

export interface PurchaseRecord {
  id: string;
  agent_id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchased_at: string;
  amount: number;
  agent_server_url: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  server_url: string;
  api_key?: string;
}

// API Functions

// Process payment
export const processPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await api.post<PaymentResponse>('/api/payment/process', data);
    return response.data;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Get user purchases
export const getUserPurchases = async (userId: string): Promise<PurchaseRecord[]> => {
  try {
    const response = await api.get<PurchaseRecord[]>(`/api/purchases/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
};

// Sync purchase to server
export const syncPurchase = async (purchase: PurchaseRecord): Promise<boolean> => {
  try {
    await api.post('/api/purchases/sync', purchase);
    return true;
  } catch (error) {
    console.error('Error syncing purchase:', error);
    return false;
  }
};

// Get agent configuration
export const getAgentConfig = async (agentId: string, userId: string): Promise<AgentConfig | null> => {
  try {
    const response = await api.get<AgentConfig>(`/api/agents/${agentId}/config`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching agent config:', error);
    return null;
  }
};

// Verify agent access
export const verifyAgentAccess = async (agentId: string, userId: string): Promise<{ hasAccess: boolean; serverUrl?: string }> => {
  try {
    const response = await api.get(`/api/agents/${agentId}/verify-access`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying agent access:', error);
    return { hasAccess: false };
  }
};

// Record activity
export const recordActivity = async (userId: string, type: string, description: string): Promise<void> => {
  try {
    await api.post('/api/activity', {
      user_id: userId,
      type,
      description,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording activity:', error);
  }
};

export default api;
