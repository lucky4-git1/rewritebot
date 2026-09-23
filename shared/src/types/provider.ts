import { ProviderProtocol, AuthenticationType, ProviderCapability } from './ai';

export interface ProviderConfig {
  id: string;
  userId: string;
  name: string;
  type: string;
  protocol: ProviderProtocol;
  baseUrl?: string;
  authenticationType: AuthenticationType;
  modelId?: string;
  isDefault: boolean;
  connectionStatus: ConnectionStatus;
  lastTested?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ConnectionStatus =
  | 'not-configured'
  | 'testing'
  | 'connected'
  | 'failed'
  | 'timeout'
  | 'unauthorized';

export interface ProviderCredentials {
  providerId: string;
  apiKey?: string;
  additionalConfig?: Record<string, string>;
}

export interface ProviderTestResult {
  success: boolean;
  status: ConnectionStatus;
  message: string;
  latency?: number;
  modelsAvailable?: boolean;
}

export interface AddProviderRequest {
  name: string;
  type: string;
  protocol: ProviderProtocol;
  baseUrl?: string;
  authenticationType: AuthenticationType;
  apiKey?: string;
  modelId?: string;
  options?: ProviderOptions;
}

export interface ProviderOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
  streamingEnabled?: boolean;
}
