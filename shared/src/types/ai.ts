export type ProviderProtocol = 'openai' | 'anthropic' | 'gemini' | 'custom';

export type AuthenticationType = 'bearer' | 'api-key' | 'none';

export type ProviderCapability =
  | 'chat'
  | 'streaming'
  | 'structured-output'
  | 'vision'
  | 'tools'
  | 'embeddings';

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  protocol: ProviderProtocol;
  baseUrl?: string;
  authenticationType: AuthenticationType;
  capabilities: ProviderCapability[];
  documentationUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  providerId: string;
  modelId: string;
  displayName: string;
  contextWindow?: number;
  capabilities: ProviderCapability[];
  streamingSupported: boolean;
  visionSupported: boolean;
  structuredOutputSupported: boolean;
}

export interface AIRequest {
  documentId?: string;
  text: string;
  mode: ParaphraseMode;
  language: string;
  synonymLevel: number;
  frozenTerms: string[];
  customInstruction?: string;
  providerId: string;
  modelId: string;
  options?: AIRequestOptions;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  timeout?: number;
}

export interface AIResponse {
  text: string;
  changes?: TextChange[];
  warnings?: string[];
  language?: string;
  provider: string;
  model: string;
  usage?: TokenUsage;
  latency: number;
  fallbackUsed?: boolean;
  failureReason?: string;
}

export interface AIChunk {
  type: 'start' | 'token' | 'metadata' | 'complete' | 'error';
  content?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface TextChange {
  type: 'insertion' | 'deletion' | 'replacement';
  original?: string;
  modified?: string;
  position: number;
  length: number;
}

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export type ParaphraseMode =
  | 'standard'
  | 'fluency'
  | 'humanize'
  | 'formal'
  | 'academic'
  | 'simple'
  | 'creative'
  | 'expand'
  | 'shorten'
  | 'custom';

export type ToolOperation = 
  | 'grammar'
  | 'humanize'
  | 'summarize'
  | 'translate'
  | 'cite';

export type CitationStyle = 
  | 'apa'
  | 'mla'
  | 'chicago'
  | 'harvard'
  | 'ieee'
  | 'vancouver';

export interface ParaphraseModeConfig {
  name: string;
  description: string;
  prompt: string;
  availableLanguages?: string[];
}

export interface CustomMode {
  id: string;
  userId: string;
  name: string;
  instruction: string;
  createdAt: Date;
}

export interface ProviderHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unavailable' | 'not-tested';
  lastSuccess?: Date;
  lastFailure?: Date;
  failureCount: number;
  averageLatency?: number;
}

// Tool Request Interfaces
export interface GrammarCheckRequest {
  text: string;
  providerId: string;
  modelId: string;
  language?: string;
}

export interface GrammarCheckResponse {
  correctedText: string;
  corrections: GrammarCorrection[];
  provider: string;
  model: string;
  latency: number;
}

export interface GrammarCorrection {
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  original: string;
  corrected: string;
  position: number;
  explanation: string;
}

export interface HumanizeRequest {
  text: string;
  providerId: string;
  modelId: string;
  level?: 'light' | 'medium' | 'strong';
}

export interface SummarizeRequest {
  text: string;
  providerId: string;
  modelId: string;
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullets';
}

export interface TranslateRequest {
  text: string;
  providerId: string;
  modelId: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface CitationRequest {
  source: CitationSource;
  style: CitationStyle;
  providerId: string;
  modelId: string;
}

export interface CitationSource {
  type: 'book' | 'article' | 'website' | 'journal' | 'other';
  title: string;
  authors: string[];
  year?: number;
  publisher?: string;
  url?: string;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  accessed?: string;
}

export interface CitationResponse {
  citation: string;
  inText: string;
  style: CitationStyle;
  provider: string;
  model: string;
  latency: number;
}
