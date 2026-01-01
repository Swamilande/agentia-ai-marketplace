import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Purchase {
  id: string;
  agentId: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: string;
  amount: number;
  agentServerUrl?: string;
}

interface PurchaseState {
  purchases: Purchase[];
  pendingPurchase: { agentId: string; amount: number } | null;
  
  // Actions
  setPendingPurchase: (agentId: string, amount: number) => void;
  clearPendingPurchase: () => void;
  completePurchase: (agentId: string, userId: string, amount: number) => void;
  hasPurchased: (agentId: string, userId: string) => boolean;
  getPurchase: (agentId: string, userId: string) => Purchase | undefined;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: [],
      pendingPurchase: null,

      setPendingPurchase: (agentId: string, amount: number) => {
        set({ pendingPurchase: { agentId, amount } });
      },

      clearPendingPurchase: () => {
        set({ pendingPurchase: null });
      },

      completePurchase: (agentId: string, userId: string, amount: number) => {
        const purchase: Purchase = {
          id: `purchase_${Date.now()}`,
          agentId,
          userId,
          status: 'completed',
          purchasedAt: new Date().toISOString(),
          amount,
          agentServerUrl: `https://agents.example.com/${agentId}`,
        };
        
        set((state) => ({
          purchases: [...state.purchases, purchase],
          pendingPurchase: null,
        }));
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
    }),
    {
      name: 'agentia-purchases',
    }
  )
);
