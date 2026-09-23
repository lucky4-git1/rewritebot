import { z } from 'zod';
import { PARAPHRASE_MODES, LANGUAGES, PROVIDER_TYPES } from '../constants';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Provider Schemas
export const addProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: z.enum([...Object.values(PROVIDER_TYPES)] as [string, ...string[]]),
  protocol: z.enum(['openai', 'anthropic', 'gemini', 'custom']),
  baseUrl: z.string().url().optional(),
  authenticationType: z.enum(['bearer', 'api-key', 'none']),
  apiKey: z.string().optional(),
  modelId: z.string().optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
      timeout: z.number().positive().optional(),
      streamingEnabled: z.boolean().optional(),
    })
    .optional(),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  modelId: z.string().optional(),
  isDefault: z.boolean().optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
      timeout: z.number().positive().optional(),
      streamingEnabled: z.boolean().optional(),
    })
    .optional(),
});

// AI Request Schemas
export const paraphraseSchema = z.object({
  documentId: z.string().uuid().optional(),
  text: z.string().min(1, 'Text is required').max(50000, 'Text is too long'),
  mode: z.enum([...PARAPHRASE_MODES] as [string, ...string[]]),
  language: z.string().default('auto'),
  synonymLevel: z.number().int().min(1).max(4).default(2),
  frozenTerms: z.array(z.string()).default([]),
  customInstruction: z.string().optional(),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
      stream: z.boolean().optional(),
      timeout: z.number().positive().optional(),
    })
    .optional(),
});

export const grammarCheckSchema = z.object({
  text: z.string().min(1).max(50000),
  language: z.string().default('auto'),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
});

export const humanizeSchema = z.object({
  text: z.string().min(1).max(50000),
  mode: z.enum(['natural', 'casual', 'professional', 'academic', 'conversational']),
  language: z.string().default('auto'),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
});

export const summarizeSchema = z.object({
  text: z.string().min(1).max(50000),
  length: z.enum(['short', 'medium', 'detailed']),
  format: z.enum(['paragraph', 'bullets', 'key-points', 'executive']),
  language: z.string().default('auto'),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
});

export const translateSchema = z.object({
  text: z.string().min(1).max(50000),
  sourceLanguage: z.string().default('auto'),
  targetLanguage: z.string().min(1),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
});

// Document Schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().default(''),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// Custom Mode Schema
export const createCustomModeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  instruction: z.string().min(1, 'Instruction is required').max(500),
});

// Preferences Schema
export const updatePreferencesSchema = z.object({
  defaultMode: z.string().optional(),
  defaultLanguage: z.string().optional(),
  defaultSynonymLevel: z.number().int().min(1).max(4).optional(),
  defaultProviderId: z.string().uuid().optional(),
  defaultModelId: z.string().optional(),
  autoSave: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type AddProviderInput = z.infer<typeof addProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ParaphraseInput = z.infer<typeof paraphraseSchema>;
export type GrammarCheckInput = z.infer<typeof grammarCheckSchema>;
export type HumanizeInput = z.infer<typeof humanizeSchema>;
export type SummarizeInput = z.infer<typeof summarizeSchema>;
export type TranslateInput = z.infer<typeof translateSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateCustomModeInput = z.infer<typeof createCustomModeSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
