import { ProviderConfig } from '../types';
import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Groq provider - ultra-fast inference
 * Uses OpenAI-compatible API
 */
export class GroqProvider extends GenericOpenAIProvider {
  constructor(config: ProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1',
    });
  }

  protected requiresApiKey(): boolean {
    return true;
  }

  protected getDefaultModel(): string {
    return this.modelId || 'llama-3.3-70b-versatile';
  }
}

export const createGroqProvider = (config: ProviderConfig): GroqProvider => {
  return new GroqProvider(config);
};
