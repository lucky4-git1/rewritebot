import { BaseProvider } from '../BaseProvider';
import { AIRequest, AIResponse, AIChunk, Model, ProviderCapability } from '@rewritebot/shared';
import { ConnectionTestResult, ProviderConfig } from '../types';

/**
 * Anthropic (Claude) provider
 * Uses Anthropic's native API
 */
export class AnthropicProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  protected getDefaultModel(): string {
    return 'claude-3-haiku-20240307';
  }

  getCapabilities(): ProviderCapability[] {
    return ['chat', 'streaming', 'vision'];
  }

  async validateCredentials(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: !!this.apiKey,
      error: this.apiKey ? undefined : 'API key missing',
      modelsAvailable: true,
    };
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        providerId: this.id,
        modelId: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet',
        capabilities: ['chat', 'streaming', 'vision'],
        contextWindow: 200000,
        streamingSupported: true,
        visionSupported: true,
        structuredOutputSupported: true,
      },
      {
        providerId: this.id,
        modelId: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        capabilities: ['chat', 'streaming'],
        contextWindow: 200000,
        streamingSupported: true,
        visionSupported: false,
        structuredOutputSupported: true,
      },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    throw new Error('Anthropic provider requires @anthropic-ai/sdk package');
  }

  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    throw new Error('Anthropic streaming not implemented');
  }
}

export const createAnthropicProvider = (config: ProviderConfig): AnthropicProvider => {
  return new AnthropicProvider(config);
};

export const anthropicMetadata = {
  type: 'anthropic',
  name: 'Anthropic (Claude)',
  protocol: 'anthropic',
  documentationUrl: 'https://docs.anthropic.com',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming', 'vision'],
};
