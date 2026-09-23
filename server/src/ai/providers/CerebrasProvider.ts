import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Cerebras provider - ultra-fast AI inference
 * Uses OpenAI-compatible API
 */
export class CerebrasProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'cerebras',
      name: config.name || 'Cerebras',
      type: 'cerebras',
      baseUrl: config.baseUrl || 'https://api.cerebras.ai/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createCerebrasProvider = (config: any): CerebrasProvider => {
  return new CerebrasProvider(config);
};
