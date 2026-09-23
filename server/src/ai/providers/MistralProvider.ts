import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Mistral AI provider - European AI company
 * Uses OpenAI-compatible API
 */
export class MistralProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'mistral',
      name: config.name || 'Mistral AI',
      type: 'mistral',
      baseUrl: config.baseUrl || 'https://api.mistral.ai/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createMistralProvider = (config: any): MistralProvider => {
  return new MistralProvider(config);
};
