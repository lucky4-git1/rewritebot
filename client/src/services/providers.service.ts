import { apiClient } from './api';
import { ProviderConfig, ProviderTestResult, AddProviderRequest } from '@rewritebot/shared';

export interface ProviderType {
  type: string;
  name: string;
  protocol: string;
  defaultBaseUrl?: string;
  documentationUrl?: string;
  requiresApiKey: boolean;
  supportsLocalhost: boolean;
  capabilities: string[];
}

export interface Model {
  providerId: string;
  modelId: string;
  displayName: string;
  contextWindow?: number;
  streamingSupported: boolean;
}

class ProvidersService {
  async getProviders(): Promise<ProviderConfig[]> {
    return apiClient.get<ProviderConfig[]>('/providers');
  }

  async getProvider(id: string): Promise<ProviderConfig> {
    return apiClient.get<ProviderConfig>(`/providers/${id}`);
  }

  async addProvider(data: AddProviderRequest): Promise<ProviderConfig> {
    return apiClient.post<ProviderConfig>('/providers', data);
  }

  async updateProvider(id: string, data: Partial<ProviderConfig>): Promise<ProviderConfig> {
    return apiClient.patch<ProviderConfig>(`/providers/${id}`, data);
  }

  async deleteProvider(id: string): Promise<void> {
    return apiClient.delete(`/providers/${id}`);
  }

  async testConnection(id: string): Promise<ProviderTestResult> {
    return apiClient.post<ProviderTestResult>(`/providers/${id}/test`, {});
  }

  async getModels(id: string): Promise<Model[]> {
    return apiClient.get<Model[]>(`/providers/${id}/models`);
  }

  async getProviderTypes(): Promise<ProviderType[]> {
    return apiClient.get<ProviderType[]>('/providers/types');
  }
}

export const providersService = new ProvidersService();
