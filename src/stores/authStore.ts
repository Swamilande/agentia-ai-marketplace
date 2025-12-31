import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Mock user for demo purposes
const createMockUser = (email: string, name?: string): User => ({
  id: `user_${Date.now()}`,
  email,
  name: name || email.split('@')[0],
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        const mockUser = createMockUser(email);
        const mockAccessToken = `mock_access_${Date.now()}`;
        const mockRefreshToken = `mock_refresh_${Date.now()}`;
        
        set({
          user: mockUser,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      signup: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful signup - user starts with empty dashboard
        const mockUser = createMockUser(email, name);
        const mockAccessToken = `mock_access_${Date.now()}`;
        const mockRefreshToken = `mock_refresh_${Date.now()}`;
        
        set({
          user: mockUser,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'agentia-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
