import { AIRequest, AIResponse, AIChunk, Model, ProviderCapability } from '@rewritebot/shared';

/**
 * Base interface that all AI providers must implement
 */
export interface IAIProvider {
  /** Unique provider identifier */
  readonly id: string;

  /** Provider display name */
  readonly name: string;

  /** Provider type (nvidia, ollama, openai, etc.) */
  readonly type: string;

  /**
   * Validate provider credentials
   * @returns true if credentials are valid
   */
  validateCredentials(): Promise<boolean>;

  /**
   * Test connection to provider
   * @returns connection test result with latency
   */
  testConnection(): Promise<ConnectionTestResult>;

  /**
   * List available models from this provider
   * @returns array of available models
   */
  listModels(): Promise<Model[]>;

  /**
   * Get capabilities of this provider
   * @returns array of supported capabilities
   */
  getCapabilities(): ProviderCapability[];

  /**
   * Check if provider supports a specific capability
   */
  supportsCapability(capability: ProviderCapability): boolean;

  /**
   * Generate completion (non-streaming)
   * @param request - The AI generation request
   * @returns generated response
   */
  generate(request: AIRequest): Promise<AIResponse>;

  /**
   * Generate completion with streaming
   * @param request - The AI generation request
   * @returns async generator of chunks
   */
  stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown>;

  /**
   * Cancel an ongoing generation
   * @param requestId - Request to cancel
   */
  cancel?(requestId: string): Promise<void>;
}

/**
 * Configuration for creating a provider instance
 */
export interface ProviderConfig {
  id: string;
  type: string;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  modelId?: string;
  options?: ProviderOptions;
}

/**
 * Provider-specific options
 */
export interface ProviderOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
  streamingEnabled?: boolean;
  [key: string]: unknown;
}

/**
 * Result of connection test
 */
export interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  modelsAvailable?: boolean;
}

/**
 * Normalized error from provider
 */
export interface ProviderError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
  statusCode?: number;
  originalError?: unknown;
}

/**
 * Provider health status
 */
export interface ProviderHealthStatus {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unavailable' | 'not-tested';
  lastSuccess?: Date;
  lastFailure?: Date;
  failureCount: number;
  averageLatency?: number;
  lastChecked: Date;
}

/**
 * Provider metadata for registration
 */
export interface ProviderMetadata {
  type: string;
  name: string;
  protocol: string;
  defaultBaseUrl?: string;
  documentationUrl?: string;
  requiresApiKey: boolean;
  supportsLocalhost: boolean;
  capabilities: ProviderCapability[];
}
