import { ProviderConfig, ProviderMetadata } from '../types';
import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Ollama provider
 * Supports local Ollama installations
 * Uses OpenAI-compatible interface
 */
export class OllamaProvider extends GenericOpenAIProvider {
  constructor(config: ProviderConfig) {
    // Set default base URL if not provided
    if (!config.baseUrl) {
      config.baseUrl = 'http://localhost:11434/v1';
    }

    super(config);
  }

  protected requiresApiKey(): boolean {
    // Ollama doesn't require authentication
    return false;
  }

  protected requiresBaseUrl(): boolean {
    return true;
  }

  protected getDefaultModel(): string {
    return this.modelId || 'llama3.2';
  }

  protected getDefaultHeaders(): Record<string, string> {
    // Ollama doesn't need authorization header
    return {
      'Content-Type': 'application/json',
    };
  }
}

/**
 * Factory function to create Ollama provider instances
 */
export function createOllamaProvider(config: ProviderConfig): OllamaProvider {
  return new OllamaProvider(config);
}

/**
 * Ollama provider metadata
 */
export const ollamaMetadata: ProviderMetadata = {
  type: 'ollama',
  name: 'Ollama',
  protocol: 'openai',
  defaultBaseUrl: 'http://localhost:11434/v1',
  documentationUrl: 'https://ollama.ai/docs',
  requiresApiKey: false,
  supportsLocalhost: true,
  capabilities: ['chat', 'streaming'],
};
