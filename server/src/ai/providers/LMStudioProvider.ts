import { ProviderConfig, ProviderMetadata } from '../types';
import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * LM Studio provider
 * Supports local LM Studio installations
 * Uses OpenAI-compatible interface
 */
export class LMStudioProvider extends GenericOpenAIProvider {
  constructor(config: ProviderConfig) {
    // Set default base URL if not provided
    if (!config.baseUrl) {
      config.baseUrl = 'http://localhost:1234/v1';
    }

    super(config);
  }

  protected requiresApiKey(): boolean {
    // LM Studio doesn't require authentication by default
    return false;
  }

  protected requiresBaseUrl(): boolean {
    return true;
  }

  protected getDefaultModel(): string {
    // LM Studio uses the loaded model name
    // User should specify this
    return this.modelId || 'local-model';
  }

  protected getDefaultHeaders(): Record<string, string> {
    // LM Studio doesn't need authorization header
    return {
      'Content-Type': 'application/json',
    };
  }
}

/**
 * Factory function to create LM Studio provider instances
 */
export function createLMStudioProvider(config: ProviderConfig): LMStudioProvider {
  return new LMStudioProvider(config);
}

/**
 * LM Studio provider metadata
 */
export const lmstudioMetadata: ProviderMetadata = {
  type: 'lmstudio',
  name: 'LM Studio',
  protocol: 'openai',
  defaultBaseUrl: 'http://localhost:1234/v1',
  documentationUrl: 'https://lmstudio.ai/docs',
  requiresApiKey: false,
  supportsLocalhost: true,
  capabilities: ['chat', 'streaming'],
};
