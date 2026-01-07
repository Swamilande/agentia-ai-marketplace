import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncPurchase, getUserPurchases, type PurchaseRecord } from '@/services/api';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Purchase {
  id: string;
  agentId: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: string;
  amount: number;
  agentServerUrl: string;
}

interface PurchaseState {
  purchases: Purchase[];
  pendingPurchase: { agentId: string; amount: number } | null;
  isLoading: boolean;
  
  // Actions
  setPendingPurchase: (agentId: string, amount: number) => void;
  clearPendingPurchase: () => void;
  completePurchase: (agentId: string, userId: string, amount: number, serverUrl?: string) => Promise<Purchase>;
  hasPurchased: (agentId: string, userId: string) => boolean;
  getPurchase: (agentId: string, userId: string) => Purchase | undefined;
  syncWithServer: (purchase: Purchase) => Promise<void>;
  fetchUserPurchases: (userId: string) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: [],
      pendingPurchase: null,
      isLoading: false,

      setPendingPurchase: (agentId: string, amount: number) => {
        set({ pendingPurchase: { agentId, amount } });
      },

      clearPendingPurchase: () => {
        set({ pendingPurchase: null });
      },

      completePurchase: async (agentId: string, userId: string, amount: number, serverUrl?: string) => {
        const purchase: Purchase = {
          id: `purchase_${Date.now()}`,
          agentId,
          userId,
          status: 'completed',
          purchasedAt: new Date().toISOString(),
          amount,
          agentServerUrl: serverUrl || `${API_BASE_URL}/agents/${agentId}`,
        };
        
        set((state) => ({
          purchases: [...state.purchases, purchase],
          pendingPurchase: null,
        }));

        // Sync with server in background
        get().syncWithServer(purchase);
        
        return purchase;
      },

      hasPurchased: (agentId: string, userId: string) => {
        return get().purchases.some(
          (p) => p.agentId === agentId && p.userId === userId && p.status === 'completed'
        );
      },

      getPurchase: (agentId: string, userId: string) => {
        return get().purchases.find(
          (p) => p.agentId === agentId && p.userId === userId && p.status === 'completed'
        );
      },

      syncWithServer: async (purchase: Purchase) => {
        try {
          const serverPurchase: PurchaseRecord = {
            id: purchase.id,
            agent_id: purchase.agentId,
            user_id: purchase.userId,
            status: purchase.status,
            purchased_at: purchase.purchasedAt,
            amount: purchase.amount,
            agent_server_url: purchase.agentServerUrl,
          };
          await syncPurchase(serverPurchase);
          console.log('Purchase synced with server:', purchase.id);
        } catch (error) {
          console.error('Failed to sync purchase with server:', error);
        }
      },

      fetchUserPurchases: async (userId: string) => {
        set({ isLoading: true });
        try {
          const serverPurchases = await getUserPurchases(userId);
          const purchases: Purchase[] = serverPurchases.map(p => ({
            id: p.id,
            agentId: p.agent_id,
            userId: p.user_id,
            status: p.status,
            purchasedAt: p.purchased_at,
            amount: p.amount,
            agentServerUrl: p.agent_server_url,
          }));
          
          // Merge with existing purchases (avoid duplicates)
          set((state) => {
            const existingIds = new Set(state.purchases.map(p => p.id));
            const newPurchases = purchases.filter(p => !existingIds.has(p.id));
            return { 
              purchases: [...state.purchases, ...newPurchases],
              isLoading: false 
            };
          });
        } catch (error) {
          console.error('Failed to fetch purchases:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'agentia-purchases',
    }
  )
);
