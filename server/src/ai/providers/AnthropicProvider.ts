import { BaseProvider } from '../BaseProvider';
import { AIRequest, AIResponse, AIChunk } from '@rewritebot/shared';

/**
 * Anthropic (Claude) provider
 * Uses Anthropic's native API
 */
export class AnthropicProvider extends BaseProvider {
  constructor(config: any) {
    super({
      ...config,
      type: 'anthropic',
      capabilities: ['chat', 'streaming', 'vision'],
    });
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    // Placeholder - full implementation would use @anthropic-ai/sdk
    throw new Error('Anthropic provider requires @anthropic-ai/sdk package');
  }

  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    throw new Error('Anthropic streaming not implemented');
  }

  async testConnection(): Promise<boolean> {
    return false;
  }

  async listModels(): Promise<Array<{ id: string; name: string }>> {
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    ];
  }
}

export const createAnthropicProvider = (config: any): AnthropicProvider => {
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
