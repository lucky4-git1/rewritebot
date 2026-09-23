import { ProviderConfig, ProviderMetadata } from '../types';
import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * NVIDIA AI provider
 * Supports both hosted NVIDIA API and self-hosted NVIDIA NIM
 * Uses OpenAI-compatible interface
 */
export class NVIDIAProvider extends GenericOpenAIProvider {
  constructor(config: ProviderConfig) {
    // Set default base URL if not provided
    if (!config.baseUrl) {
      config.baseUrl = 'https://integrate.api.nvidia.com/v1';
    }

    super(config);
  }

  protected requiresApiKey(): boolean {
    // NVIDIA hosted API requires an API key
    // Self-hosted NIM might not
    return this.baseUrl?.includes('nvidia.com') ?? true;
  }

  protected getDefaultModel(): string {
    return this.modelId || 'meta/llama-3.1-8b-instruct';
  }
}

/**
 * Factory function to create NVIDIA provider instances
 */
export function createNVIDIAProvider(config: ProviderConfig): NVIDIAProvider {
  return new NVIDIAProvider(config);
}

/**
 * NVIDIA provider metadata
 */
export const nvidiaMetadata: ProviderMetadata = {
  type: 'nvidia',
  name: 'NVIDIA',
  protocol: 'openai',
  defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
  documentationUrl: 'https://docs.nvidia.com/ai-enterprise/',
  requiresApiKey: true,
  supportsLocalhost: true,
  capabilities: ['chat', 'streaming'],
};
