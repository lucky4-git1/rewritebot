import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * Groq provider - ultra-fast inference
 * Uses OpenAI-compatible API
 */
export class GroqProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'groq',
      name: config.name || 'Groq',
      type: 'groq',
      baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createGroqProvider = (config: any): GroqProvider => {
  return new GroqProvider(config);
};
