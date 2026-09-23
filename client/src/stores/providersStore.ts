import { create } from 'zustand';
import { ProviderConfig } from '@rewritebot/shared';
import { providersService, ProviderType, Model } from '../services/providers.service';

interface ProvidersState {
  providers: ProviderConfig[];
  providerTypes: ProviderType[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProviders: () => Promise<void>;
  loadProviderTypes: () => Promise<void>;
  addProvider: (data: any) => Promise<ProviderConfig>;
  updateProvider: (id: string, data: Partial<ProviderConfig>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ success: boolean; message: string }>;
  getModels: (id: string) => Promise<Model[]>;
  getDefaultProvider: () => ProviderConfig | null;
  clearError: () => void;
}

export const useProvidersStore = create<ProvidersState>((set, get) => ({
  providers: [],
  providerTypes: [],
  isLoading: false,
  error: null,

  loadProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const providers = await providersService.getProviders();
      set({ providers, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load providers',
        isLoading: false,
      });
    }
  },

  loadProviderTypes: async () => {
    try {
      const providerTypes = await providersService.getProviderTypes();
      set({ providerTypes });
    } catch (error) {
      console.error('Failed to load provider types:', error);
    }
  },

  addProvider: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const provider = await providersService.addProvider(data);
      set((state) => ({
        providers: [...state.providers, provider],
        isLoading: false,
      }));
      return provider;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add provider',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProvider: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await providersService.updateProvider(id, data);
      set((state) => ({
        providers: state.providers.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update provider',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProvider: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await providersService.deleteProvider(id);
      set((state) => ({
        providers: state.providers.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete provider',
        isLoading: false,
      });
      throw error;
    }
  },

  testConnection: async (id) => {
    try {
      const result = await providersService.testConnection(id);
      
      // Update provider status
      if (result.success) {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id
              ? { ...p, connectionStatus: 'connected', lastTested: new Date() }
              : p
          ),
        }));
      }

      return {
        success: result.success,
        message: result.message || (result.success ? 'Connection successful' : 'Connection failed'),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  },

  getModels: async (id) => {
    try {
      return await providersService.getModels(id);
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  },

  getDefaultProvider: () => {
    const { providers } = get();
    return providers.find((p) => p.isDefault) || providers[0] || null;
  },

  clearError: () => set({ error: null }),
}));
