// Mock Dashboard Data Structure
// This file contains temporary mock data for the dashboard UI
// Replace with real API calls when backend is connected

export interface DashboardAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  status: 'active' | 'inactive' | 'draft';
  apiCalls: number;
  createdAt: string;
  purchasedAt?: string;
}

export interface DashboardTransaction {
  id: string;
  agentName: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface DashboardStats {
  totalAgents: number;
  apiCalls: string;
  avgResponse: string;
  successRate: string;
}

export interface ActivityItem {
  id: string;
  type: 'purchase' | 'created' | 'api_call' | 'settings_update';
  description: string;
  timestamp: string;
}

// Empty state data for new users
export const emptyDashboardData = {
  stats: {
    totalAgents: 0,
    apiCalls: '0',
    avgResponse: '-',
    successRate: '-',
  },
  createdAgents: [] as DashboardAgent[],
  purchasedAgents: [] as DashboardAgent[],
  transactions: [] as DashboardTransaction[],
  activityHistory: [] as ActivityItem[],
};

// Mock data for users with content (for testing)
export const mockDashboardData = {
  stats: {
    totalAgents: 3,
    apiCalls: '12.4K',
    avgResponse: '0.8s',
    successRate: '99.2%',
  },
  createdAgents: [
    {
      id: 'created-1',
      name: 'My Custom Support Bot',
      description: 'A custom support bot I created for my business.',
      category: 'Customer Service',
      imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600',
      status: 'active' as const,
      apiCalls: 1240,
      createdAt: '2024-12-01T10:00:00Z',
    },
  ],
  purchasedAgents: [
    {
      id: '1',
      name: 'Customer Support AI',
      description: 'Intelligent customer support that handles inquiries 24/7.',
      category: 'Customer Service',
      imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600',
      status: 'active' as const,
      apiCalls: 2400,
      createdAt: '2024-11-15T10:00:00Z',
      purchasedAt: '2024-12-28T10:00:00Z',
    },
    {
      id: '2',
      name: 'Sales Assistant Pro',
      description: 'AI-powered sales assistant that qualifies leads.',
      category: 'Sales',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      status: 'active' as const,
      apiCalls: 1800,
      createdAt: '2024-10-20T10:00:00Z',
      purchasedAt: '2024-12-15T10:00:00Z',
    },
    {
      id: '3',
      name: 'Data Analyst Bot',
      description: 'Automates data analysis and generates insights.',
      category: 'Analytics',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
      status: 'active' as const,
      apiCalls: 3200,
      createdAt: '2024-09-10T10:00:00Z',
      purchasedAt: '2024-12-01T10:00:00Z',
    },
  ],
  transactions: [
    { id: '1', agentName: 'Customer Support AI', date: 'Dec 28, 2024', amount: '$49', status: 'completed' as const },
    { id: '2', agentName: 'Sales Assistant Pro', date: 'Dec 15, 2024', amount: '$79', status: 'completed' as const },
    { id: '3', agentName: 'Data Analyst Bot', date: 'Dec 1, 2024', amount: '$99', status: 'completed' as const },
  ],
  activityHistory: [
    { id: '1', type: 'purchase' as const, description: 'Purchased Customer Support AI', timestamp: '2024-12-28T10:00:00Z' },
    { id: '2', type: 'api_call' as const, description: 'API call limit increased to 10K/month', timestamp: '2024-12-20T14:30:00Z' },
    { id: '3', type: 'purchase' as const, description: 'Purchased Sales Assistant Pro', timestamp: '2024-12-15T09:00:00Z' },
    { id: '4', type: 'settings_update' as const, description: 'Updated profile information', timestamp: '2024-12-10T16:45:00Z' },
  ],
};

// Instructions for connecting to real backend:
// 
// 1. AUTHENTICATION:
//    Replace the mock login/signup in authStore.ts with:
//    - POST /auth/login → returns { access_token, refresh_token, user }
//    - POST /auth/register → returns { access_token, refresh_token, user }
//    - GET /auth/me → returns current user session
//
// 2. DASHBOARD DATA:
//    Replace mock data fetches with:
//    - GET /users/dashboard → returns stats
//    - GET /users/my-agents → returns purchased agents
//    - GET /users/payment-history → returns transactions
//    - GET /users/stats → returns detailed analytics
//
// 3. AGENT OPERATIONS:
//    - POST /agents/{id}/access → get agent session token
//    - GET /agents/{id}/analytics → get agent-specific analytics
//
// 4. TOKEN REFRESH:
//    Set up an axios interceptor to:
//    - Inject Authorization: Bearer {accessToken} header
//    - On 401, call POST /auth/refresh with refreshToken
//    - Retry failed request with new token
