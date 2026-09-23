import { BaseProvider } from '../BaseProvider';
import { AIRequest, AIResponse, AIChunk } from '@rewritebot/shared';

/**
 * Google Gemini provider
 * Uses Google's Generative AI SDK
 */
export class GeminiProvider extends BaseProvider {
  constructor(config: any) {
    super({
      ...config,
      type: 'gemini',
      capabilities: ['chat', 'streaming', 'vision'],
    });
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    // Placeholder - full implementation would use @google/generative-ai
    throw new Error('Gemini provider requires @google/generative-ai package');
  }

  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    throw new Error('Gemini streaming not implemented');
  }

  async testConnection(): Promise<boolean> {
    return false;
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    return [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ];
  }
}

export const createGeminiProvider = (config: any): GeminiProvider => {
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
