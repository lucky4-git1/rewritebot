// Provider implementations
export * from './GenericOpenAIProvider';
export * from './NVIDIAProvider';
export * from './OllamaProvider';
export * from './LMStudioProvider';
export * from './OpenAIProvider';
export * from './AnthropicProvider';
export * from './GeminiProvider';
export * from './OpenRouterProvider';
export * from './GroqProvider';
export * from './TogetherProvider';
export * from './DeepSeekProvider';
export * from './MistralProvider';
export * from './CerebrasProvider';
export * from './HuggingFaceProvider';
export * from './XAIProvider';

// Provider metadata
import { ProviderMetadata } from '../types';
import { nvidiaMetadata } from './NVIDIAProvider';
import { ollamaMetadata } from './OllamaProvider';
import { lmstudioMetadata } from './LMStudioProvider';

/**
 * Generic OpenAI-compatible provider metadata
 */
export const genericOpenAIMetadata: ProviderMetadata = {
  type: 'generic-openai',
  name: 'Generic OpenAI-Compatible',
  protocol: 'openai',
  documentationUrl: 'https://platform.openai.com/docs/api-reference',
  requiresApiKey: false, // Configurable
  supportsLocalhost: true,
  capabilities: ['chat', 'streaming'],
};

/**
 * Cloud provider metadata
 */
export const openaiMetadata: ProviderMetadata = {
  type: 'openai',
  name: 'OpenAI',
  protocol: 'openai',
  documentationUrl: 'https://platform.openai.com/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming', 'vision', 'tools', 'structured-output'],
};

export const anthropicMetadata: ProviderMetadata = {
  type: 'anthropic',
  name: 'Anthropic (Claude)',
  protocol: 'anthropic',
  documentationUrl: 'https://docs.anthropic.com',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming', 'vision'],
};

export const geminiMetadata: ProviderMetadata = {
  type: 'gemini',
  name: 'Google Gemini',
  protocol: 'gemini',
  documentationUrl: 'https://ai.google.dev/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming', 'vision'],
};

export const openrouterMetadata: ProviderMetadata = {
  type: 'openrouter',
  name: 'OpenRouter',
  protocol: 'openai',
  documentationUrl: 'https://openrouter.ai/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const groqMetadata: ProviderMetadata = {
  type: 'groq',
  name: 'Groq',
  protocol: 'openai',
  documentationUrl: 'https://console.groq.com/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const togetherMetadata: ProviderMetadata = {
  type: 'together',
  name: 'Together AI',
  protocol: 'openai',
  documentationUrl: 'https://docs.together.ai',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const deepseekMetadata: ProviderMetadata = {
  type: 'deepseek',
  name: 'DeepSeek',
  protocol: 'openai',
  documentationUrl: 'https://platform.deepseek.com/docs',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const mistralMetadata: ProviderMetadata = {
  type: 'mistral',
  name: 'Mistral AI',
  protocol: 'openai',
  documentationUrl: 'https://docs.mistral.ai',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const cerebrasMetadata: ProviderMetadata = {
  type: 'cerebras',
  name: 'Cerebras',
  protocol: 'openai',
  documentationUrl: 'https://docs.cerebras.ai',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const huggingfaceMetadata: ProviderMetadata = {
  type: 'huggingface',
  name: 'HuggingFace',
  protocol: 'openai',
  documentationUrl: 'https://huggingface.co/docs/api-inference',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

export const xaiMetadata: ProviderMetadata = {
  type: 'xai',
  name: 'xAI (Grok)',
  protocol: 'openai',
  documentationUrl: 'https://docs.x.ai',
  requiresApiKey: true,
  supportsLocalhost: false,
  capabilities: ['chat', 'streaming'],
};

/**
 * All provider metadata
 */
export const providerMetadataList: ProviderMetadata[] = [
  // Local providers
  genericOpenAIMetadata,
  ollamaMetadata,
  lmstudioMetadata,
  // Cloud providers
  openaiMetadata,
  anthropicMetadata,
  geminiMetadata,
  nvidiaMetadata,
  openrouterMetadata,
  groqMetadata,
  togetherMetadata,
  deepseekMetadata,
  mistralMetadata,
  cerebrasMetadata,
  huggingfaceMetadata,
  xaiMetadata,
];
