import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Together AI provider - open-source models
 * Uses OpenAI-compatible API
 */
export class TogetherProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'together',
      name: config.name || 'Together AI',
      type: 'together',
      baseUrl: config.baseUrl || 'https://api.together.xyz/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createTogetherProvider = (config: any): TogetherProvider => {
  return new TogetherProvider(config);
};
