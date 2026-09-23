import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * xAI (Grok) provider by Elon Musk
 * Uses OpenAI-compatible API
 */
export class XAIProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'xai',
      name: config.name || 'xAI (Grok)',
      type: 'xai',
      baseUrl: config.baseUrl || 'https://api.x.ai/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createXAIProvider = (config: any): XAIProvider => {
  return new XAIProvider(config);
};
