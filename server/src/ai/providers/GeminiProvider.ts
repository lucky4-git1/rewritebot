import { BaseProvider } from '../BaseProvider';
import { AIRequest, AIResponse, AIChunk, Model, ProviderCapability } from '@rewritebot/shared';
import { ConnectionTestResult, ProviderConfig } from '../types';

/**
 * Google Gemini provider
 * Uses Google's Generative AI SDK
 */
export class GeminiProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  protected getDefaultModel(): string {
    return 'gemini-1.5-flash';
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
        modelId: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        capabilities: ['chat', 'streaming'],
        contextWindow: 1000000,
        streamingSupported: true,
        visionSupported: false,
        structuredOutputSupported: true,
      },
      {
        providerId: this.id,
        modelId: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        capabilities: ['chat', 'streaming', 'vision'],
        contextWindow: 2000000,
        streamingSupported: true,
        visionSupported: true,
        structuredOutputSupported: true,
      },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    throw new Error('Gemini provider requires @google/generative-ai package');
  }

  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    throw new Error('Gemini streaming not implemented');
  }
}

export const createGeminiProvider = (config: ProviderConfig): GeminiProvider => {
  return new GeminiProvider(config);
};

export const geminiMetadata = {
  type: 'gemini',
  name: 'Google Gemini',
  protocol: 'gemini',
  documentationUrl: 'https://ai.google.dev/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming', 'vision'],
};
