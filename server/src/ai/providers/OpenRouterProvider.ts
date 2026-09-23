import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * OpenRouter provider - aggregates multiple AI providers
 * Uses OpenAI-compatible API
 */
export class OpenRouterProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'openrouter',
      name: config.name || 'OpenRouter',
      type: 'openrouter',
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createOpenRouterProvider = (config: any): OpenRouterProvider => {
  return new OpenRouterProvider(config);
};
