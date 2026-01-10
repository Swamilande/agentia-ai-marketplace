import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Simple encryption/decryption for data protection
const encryptData = (data: string): string => {
  const key = 'agentia-secret-key';
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encrypted);
};

const decryptData = (encrypted: string): string => {
  const key = 'agentia-secret-key';
  const data = atob(encrypted);
  let decrypted = '';
  for (let i = 0; i < data.length; i++) {
    decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return decrypted;
};

export interface AgentSetupConfig {
  agentId: string;
  userId: string;
  setupCompleted: boolean;
  setupData: {
    businessName?: string;
    industry?: string;
    targetAudience?: string;
    goals?: string[];
    apiKeys?: { [key: string]: string };
    webhookUrl?: string;
    customPrompt?: string;
    dataSource?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Stored file data for persistent memory
export interface StoredFileData {
  id: string;
  name: string;
  size: number;
  type: string;
  processedContent: string; // The extracted text content
  base64Data?: string; // For images
  uploadedAt: string;
}

// Chat message for persistent history
export interface StoredMessage {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
  encrypted: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'error';
  executionTime?: number;
  tokensUsed?: number;
  provider?: 'gemini' | 'openai';
  files?: { name: string; size: number }[];
  outputs?: {
    filename: string;
    mimeType: string;
    base64Data: string;
    size: number;
  }[];
}

export interface AgentSession {
  agentId: string;
  userId: string;
  sessionId: string;
  status: 'active' | 'paused' | 'stopped';
  startedAt: string;
  lastActivity: string;
  
  // Chat history (persistent)
  messages: StoredMessage[];
  
  // Stored file data (persistent across messages)
  storedFiles: StoredFileData[];
  
  // Legacy history (keeping for compatibility)
  inputHistory: { timestamp: string; input: string; encrypted: string }[];
  outputHistory: { timestamp: string; output: string; encrypted: string }[];
  
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
  };
}

interface AgentConfigState {
  configs: AgentSetupConfig[];
  sessions: AgentSession[];
  
  // Setup actions
  getConfig: (agentId: string, userId: string) => AgentSetupConfig | undefined;
  saveConfig: (config: AgentSetupConfig) => void;
  updateConfig: (agentId: string, userId: string, updates: Partial<AgentSetupConfig['setupData']>) => void;
  isSetupComplete: (agentId: string, userId: string) => boolean;
  
  // Session actions
  getSession: (agentId: string, userId: string) => AgentSession | undefined;
  startSession: (agentId: string, userId: string) => AgentSession;
  updateSessionStatus: (sessionId: string, status: AgentSession['status']) => void;
  addInput: (sessionId: string, input: string) => void;
  addOutput: (sessionId: string, output: string) => void;
  updateMetrics: (sessionId: string, metrics: Partial<AgentSession['metrics']>) => void;
  
  // New: Message persistence
  addMessage: (sessionId: string, message: StoredMessage) => void;
  getMessages: (sessionId: string) => StoredMessage[];
  clearMessages: (sessionId: string) => void;
  
  // New: File data persistence
  storeFileData: (sessionId: string, fileData: StoredFileData) => void;
  getStoredFiles: (sessionId: string) => StoredFileData[];
  clearStoredFiles: (sessionId: string) => void;
  
  // Server sync
  syncConfigToServer: (config: AgentSetupConfig) => Promise<boolean>;
  syncSessionToServer: (session: AgentSession) => Promise<boolean>;
}

export const useAgentConfigStore = create<AgentConfigState>()(
  persist(
    (set, get) => ({
      configs: [],
      sessions: [],
      
      getConfig: (agentId: string, userId: string) => {
        return get().configs.find(c => c.agentId === agentId && c.userId === userId);
      },
      
      saveConfig: (config: AgentSetupConfig) => {
        set((state) => {
          const existingIndex = state.configs.findIndex(
            c => c.agentId === config.agentId && c.userId === config.userId
          );
          
          if (existingIndex >= 0) {
            const updated = [...state.configs];
            updated[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
            return { configs: updated };
          }
          
          return { configs: [...state.configs, config] };
        });
        
        // Sync to server
        get().syncConfigToServer(config);
      },
      
      updateConfig: (agentId: string, userId: string, updates: Partial<AgentSetupConfig['setupData']>) => {
        set((state) => {
          const updated = state.configs.map(c => {
            if (c.agentId === agentId && c.userId === userId) {
              return {
                ...c,
                setupData: { ...c.setupData, ...updates },
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          });
          return { configs: updated };
        });
      },
      
      isSetupComplete: (agentId: string, userId: string) => {
        const config = get().configs.find(c => c.agentId === agentId && c.userId === userId);
        return config?.setupCompleted || false;
      },
      
      getSession: (agentId: string, userId: string) => {
        return get().sessions.find(s => s.agentId === agentId && s.userId === userId);
      },
      
      startSession: (agentId: string, userId: string) => {
        const existingSession = get().sessions.find(s => s.agentId === agentId && s.userId === userId);
        
        if (existingSession) {
          set((state) => ({
            sessions: state.sessions.map(s =>
              s.sessionId === existingSession.sessionId
                ? { ...s, status: 'active' as const, lastActivity: new Date().toISOString() }
                : s
            ),
          }));
          return { ...existingSession, status: 'active' as const };
        }
        
        const newSession: AgentSession = {
          agentId,
          userId,
          sessionId: `session_${Date.now()}`,
          status: 'active',
          startedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messages: [],
          storedFiles: [],
          inputHistory: [],
          outputHistory: [],
          metrics: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
          },
        };
        
        set((state) => ({ sessions: [...state.sessions, newSession] }));
        get().syncSessionToServer(newSession);
        
        return newSession;
      },
      
      updateSessionStatus: (sessionId: string, status: AgentSession['status']) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? { ...s, status, lastActivity: new Date().toISOString() }
              : s
          ),
        }));
      },
      
      addInput: (sessionId: string, input: string) => {
        const encrypted = encryptData(input);
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  inputHistory: [
                    ...s.inputHistory,
                    { timestamp: new Date().toISOString(), input, encrypted },
                  ],
                  lastActivity: new Date().toISOString(),
                  metrics: {
                    ...s.metrics,
                    totalRequests: s.metrics.totalRequests + 1,
                  },
                }
              : s
          ),
        }));
      },
      
      addOutput: (sessionId: string, output: string) => {
        const encrypted = encryptData(output);
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  outputHistory: [
                    ...s.outputHistory,
                    { timestamp: new Date().toISOString(), output, encrypted },
                  ],
                  lastActivity: new Date().toISOString(),
                  metrics: {
                    ...s.metrics,
                    successfulRequests: s.metrics.successfulRequests + 1,
                  },
                }
              : s
          ),
        }));
      },
      
      updateMetrics: (sessionId: string, metrics: Partial<AgentSession['metrics']>) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? { ...s, metrics: { ...s.metrics, ...metrics } }
              : s
          ),
        }));
      },
      
      // New: Message persistence methods
      addMessage: (sessionId: string, message: StoredMessage) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  messages: [...(s.messages || []), message],
                  lastActivity: new Date().toISOString(),
                }
              : s
          ),
        }));
      },
      
      getMessages: (sessionId: string) => {
        const session = get().sessions.find(s => s.sessionId === sessionId);
        return session?.messages || [];
      },
      
      clearMessages: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? { ...s, messages: [], lastActivity: new Date().toISOString() }
              : s
          ),
        }));
      },
      
      // New: File data persistence methods
      storeFileData: (sessionId: string, fileData: StoredFileData) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? {
                  ...s,
                  storedFiles: [...(s.storedFiles || []), fileData],
                  lastActivity: new Date().toISOString(),
                }
              : s
          ),
        }));
      },
      
      getStoredFiles: (sessionId: string) => {
        const session = get().sessions.find(s => s.sessionId === sessionId);
        return session?.storedFiles || [];
      },
      
      clearStoredFiles: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.sessionId === sessionId
              ? { ...s, storedFiles: [], lastActivity: new Date().toISOString() }
              : s
          ),
        }));
      },
      
      syncConfigToServer: async (config: AgentSetupConfig) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/agents/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: config.agentId,
              user_id: config.userId,
              setup_completed: config.setupCompleted,
              setup_data: config.setupData,
              created_at: config.createdAt,
              updated_at: config.updatedAt,
            }),
          });
          return response.ok;
        } catch (error) {
          console.error('Failed to sync config to server:', error);
          return false;
        }
      },
      
      syncSessionToServer: async (session: AgentSession) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/agents/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: session.agentId,
              user_id: session.userId,
              session_id: session.sessionId,
              status: session.status,
              started_at: session.startedAt,
              last_activity: session.lastActivity,
              metrics: session.metrics,
            }),
          });
          return response.ok;
        } catch (error) {
          console.error('Failed to sync session to server:', error);
          return false;
        }
      },
    }),
    {
      name: 'agentia-agent-configs',
    }
  )
);

export { encryptData, decryptData };
