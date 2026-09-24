import { AIRequest, AIResponse, AIChunk, Model, ProviderCapability } from '@rewritebot/shared';
import {
  IAIProvider,
  ProviderConfig,
  ProviderOptions,
  ConnectionTestResult,
  ProviderError,
} from './types';
import { ProviderError as ProviderErrorClass } from '../utils/errors';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Base class for all AI providers
 * Provides common functionality and structure
 */
export abstract class BaseProvider implements IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  protected baseUrl?: string;
  protected apiKey?: string;
  protected modelId?: string;
  protected options: ProviderOptions;
  protected client: AxiosInstance;

  constructor(config: ProviderConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
    this.options = config.options || {};

    // Create HTTP client with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.options.timeout || 120000, // 120 seconds for slow AI APIs
      headers: this.getDefaultHeaders(),
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleHttpError(error)
    );
  }

  /**
   * Get default HTTP headers
   * Override in subclasses for provider-specific headers
   */
  protected getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Handle HTTP errors and convert to provider errors
   */
  protected handleHttpError(error: AxiosError | any): never {
    // Handle OpenAI SDK errors (not AxiosErrors)
    if (error?.status || error?.response?.status) {
      const statusCode = error.status || error.response?.status;
      const errorMessage = error.message || 'Provider request failed';
      let code = 'PROVIDER_ERROR';
      let retryable = false;

      if (statusCode === 401 || statusCode === 403) {
        code = 'PROVIDER_UNAUTHORIZED';
        retryable = false;
      } else if (statusCode === 404 || statusCode === 410) {
        code = 'MODEL_NOT_FOUND';
        retryable = false;
      } else if (statusCode === 429) {
        code = 'PROVIDER_RATE_LIMITED';
        retryable = true;
      } else if (statusCode >= 500) {
        code = 'PROVIDER_SERVER_ERROR';
        retryable = true;
      } else if (statusCode === 400) {
        code = 'PROVIDER_BAD_REQUEST';
        retryable = false;
      }

      throw new ProviderErrorClass(errorMessage, this.type, retryable, {
        code,
        statusCode,
      }, statusCode >= 500 ? 502 : statusCode === 429 ? 429 : 502, code);
    }

    // Handle connection errors
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      throw new ProviderErrorClass('Provider request timed out', this.type, true, {
        code: 'PROVIDER_TIMEOUT',
      }, 504, 'PROVIDER_TIMEOUT');
    }
    if (error?.code === 'ECONNREFUSED') {
      throw new ProviderErrorClass('Provider is unavailable. Check that the endpoint is running.', this.type, true, {
        code: 'PROVIDER_UNAVAILABLE',
      }, 502, 'PROVIDER_UNAVAILABLE');
    }

    // Fallback
    const message = error instanceof Error ? error.message : 'Provider request failed';
    throw new ProviderErrorClass(message, this.type, false, {
      code: 'PROVIDER_ERROR',
    });
  }

  /**
   * Extract error message from provider response
   * Override in subclasses for provider-specific error formats
   */
  protected extractErrorMessage(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const errorObj = data as Record<string, unknown>;
      if (typeof errorObj.error === 'string') {
        return errorObj.error;
      }
      if (typeof errorObj.message === 'string') {
        return errorObj.message;
      }
      if (
        typeof errorObj.error === 'object' &&
        errorObj.error !== null &&
        typeof (errorObj.error as Record<string, unknown>).message === 'string'
      ) {
        return (errorObj.error as Record<string, unknown>).message as string;
      }
    }
    return 'Unknown provider error';
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.baseUrl && this.requiresBaseUrl()) {
      throw new Error(`Base URL is required for ${this.type} provider`);
    }
    if (!this.apiKey && this.requiresApiKey()) {
      throw new Error(`API key is required for ${this.type} provider`);
    }
  }

  /**
   * Whether this provider requires a base URL
   * Override in subclasses
   */
  protected requiresBaseUrl(): boolean {
    return false;
  }

  /**
   * Whether this provider requires an API key
   * Override in subclasses
   */
  protected requiresApiKey(): boolean {
    return true;
  }

  /**
   * Get the model ID to use for requests
   */
  protected getModelId(request: AIRequest): string {
    return request.modelId || this.modelId || this.getDefaultModel();
  }

  /**
   * Get default model for this provider
   * Override in subclasses
   */
  protected abstract getDefaultModel(): string;

  // Abstract methods that must be implemented by subclasses
  abstract validateCredentials(): Promise<boolean>;
  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract listModels(): Promise<Model[]>;
  abstract getCapabilities(): ProviderCapability[];
  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown>;

  /**
   * Check if provider supports a capability
   */
  supportsCapability(capability: ProviderCapability): boolean {
    return this.getCapabilities().includes(capability);
  }

  /**
   * Measure latency for an operation
   */
  protected async measureLatency<T>(operation: () => Promise<T>): Promise<[T, number]> {
    const start = Date.now();
    const result = await operation();
    const latency = Date.now() - start;
    return [result, latency];
  }

  /**
   * Create a provider error
   */
  protected createError(
    message: string,
    retryable: boolean = false,
    code?: string
  ): ProviderErrorClass {
    return new ProviderErrorClass(message, this.type, retryable, { code });
  }
}
