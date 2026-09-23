import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * DeepSeek provider - Chinese AI company
 * Uses OpenAI-compatible API
 */
export class DeepSeekProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'deepseek',
      name: config.name || 'DeepSeek',
      type: 'deepseek',
      baseUrl: config.baseUrl || 'https://api.deepseek.com/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createDeepSeekProvider = (config: any): DeepSeekProvider => {
  return new DeepSeekProvider(config);
};
