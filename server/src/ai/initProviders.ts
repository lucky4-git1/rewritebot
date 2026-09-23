import { providerRegistry } from './ProviderRegistry';
import {
  createGenericOpenAIProvider,
  createNVIDIAProvider,
  createOllamaProvider,
  createLMStudioProvider,
  createOpenAIProvider,
  createAnthropicProvider,
  createGeminiProvider,
  createOpenRouterProvider,
  createGroqProvider,
  createTogetherProvider,
  createDeepSeekProvider,
  createMistralProvider,
  createCerebrasProvider,
  createHuggingFaceProvider,
  createXAIProvider,
  genericOpenAIMetadata,
  nvidiaMetadata,
  ollamaMetadata,
  lmstudioMetadata,
  openaiMetadata,
  anthropicMetadata,
  geminiMetadata,
  openrouterMetadata,
  groqMetadata,
  togetherMetadata,
  deepseekMetadata,
  mistralMetadata,
  cerebrasMetadata,
  huggingfaceMetadata,
  xaiMetadata,
} from './providers';
import { logger } from '../config/logger';

/**
 * Initialize and register all provider types
 * This should be called once on application startup
 */
export function initializeProviders(): void {
  logger.info('Initializing AI providers...');

  // Register Generic OpenAI-compatible provider
  providerRegistry.registerProviderType(
    'generic-openai',
    createGenericOpenAIProvider,
    genericOpenAIMetadata
  );

  // Register local providers
  providerRegistry.registerProviderType(
    'ollama',
    createOllamaProvider,
    ollamaMetadata
  );

  providerRegistry.registerProviderType(
    'lmstudio',
    createLMStudioProvider,
    lmstudioMetadata
  );

  // Register cloud providers
  providerRegistry.registerProviderType(
    'openai',
    createOpenAIProvider,
    openaiMetadata
  );

  providerRegistry.registerProviderType(
    'anthropic',
    createAnthropicProvider,
    anthropicMetadata
  );

  providerRegistry.registerProviderType(
    'gemini',
    createGeminiProvider,
    geminiMetadata
  );

  providerRegistry.registerProviderType(
    'nvidia',
    createNVIDIAProvider,
    nvidiaMetadata
  );

  providerRegistry.registerProviderType(
    'openrouter',
    createOpenRouterProvider,
    openrouterMetadata
  );

  providerRegistry.registerProviderType(
    'groq',
    createGroqProvider,
    groqMetadata
  );

  providerRegistry.registerProviderType(
    'together',
    createTogetherProvider,
    togetherMetadata
  );

  providerRegistry.registerProviderType(
    'deepseek',
    createDeepSeekProvider,
    deepseekMetadata
  );

  providerRegistry.registerProviderType(
    'mistral',
    createMistralProvider,
    mistralMetadata
  );

  providerRegistry.registerProviderType(
    'cerebras',
    createCerebrasProvider,
    cerebrasMetadata
  );

  providerRegistry.registerProviderType(
    'huggingface',
    createHuggingFaceProvider,
    huggingfaceMetadata
  );

  providerRegistry.registerProviderType(
    'xai',
    createXAIProvider,
    xaiMetadata
  );

  logger.info(`✓ Registered ${providerRegistry.getProviderTypes().length} provider types`);
  logger.info('Available providers: Generic OpenAI, Ollama, LM Studio, OpenAI, Anthropic, Gemini, NVIDIA, OpenRouter, Groq, Together, DeepSeek, Mistral, Cerebras, HuggingFace, xAI');
}
