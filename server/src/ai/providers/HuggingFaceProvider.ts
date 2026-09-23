import { GenericOpenAIProvider } from './GenericOpenAIProvider';

/**
 * HuggingFace Inference API provider
 * Uses OpenAI-compatible API for certain endpoints
 */
export class HuggingFaceProvider extends GenericOpenAIProvider {
  constructor(config: any) {
    super({
      ...config,
      id: config.id || 'huggingface',
      name: config.name || 'HuggingFace',
      type: 'huggingface',
      baseUrl: config.baseUrl || 'https://api-inference.huggingface.co/v1',
      authenticationType: 'bearer',
      capabilities: ['chat', 'streaming'],
    });
  }
}

export const createHuggingFaceProvider = (config: any): HuggingFaceProvider => {
  return new HuggingFaceProvider(config);
};
