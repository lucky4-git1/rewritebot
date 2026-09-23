import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Official OpenAI provider
 * Uses OpenAI SDK with official API
 */
export class OpenAIProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'openai',
      name: config.name || 'OpenAI',
      type: 'openai',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming', 'vision', 'tools', 'structured-output'],
    });
  }
}

export const createOpenAIProvider = (config: any): OpenAIProvider => {
  return new OpenAIProvider(config);
};
