import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeyState {
  geminiApiKey: string;
  openaiApiKey: string;
  defaultProvider: 'gemini' | 'openai';
  
  // Actions
  setGeminiApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
  setDefaultProvider: (provider: 'gemini' | 'openai') => void;
  hasGeminiKey: () => boolean;
  hasOpenaiKey: () => boolean;
  clearKeys: () => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      geminiApiKey: '',
      openaiApiKey: '',
      defaultProvider: 'gemini',
      
      setGeminiApiKey: (key: string) => {
        set({ geminiApiKey: key });
      },
      
      setOpenaiApiKey: (key: string) => {
        set({ openaiApiKey: key });
      },
      
      setDefaultProvider: (provider: 'gemini' | 'openai') => {
        set({ defaultProvider: provider });
      },
      
      hasGeminiKey: () => {
        const storeKey = get().geminiApiKey;
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        return !!(storeKey || envKey);
      },
      
      hasOpenaiKey: () => {
        const storeKey = get().openaiApiKey;
        const envKey = import.meta.env.VITE_OPENAI_API_KEY;
        return !!(storeKey || envKey);
      },
      
      clearKeys: () => {
        set({ geminiApiKey: '', openaiApiKey: '' });
      },
    }),
    {
      name: 'agentia-api-keys',
    }
  )
);

// Helper to get the active API key (store takes precedence over env)
export function getGeminiApiKey(): string {
  const store = useApiKeyStore.getState();
  return store.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function getOpenaiApiKey(): string {
  const store = useApiKeyStore.getState();
  return store.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
}
