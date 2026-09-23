import { AIRequest, AIResponse, AIChunk } from '@rewritebot/shared';
import { providerRegistry } from './ProviderRegistry';
import { PromptEngine } from './PromptEngine';
import { responseNormalizer } from './ResponseNormalizer';
import { logger } from '../config/logger';
import { ValidationError, ProviderError, NotFoundError } from '../utils/errors';
import { calculateStatistics } from '../utils/statistics';
import { prisma } from '../database/prisma';
import { decrypt } from '../security/crypto';
import { IAIProvider } from './types';

/**
 * Main orchestrator for AI operations
 * Coordinates providers, prompts, and responses
 */
export class AIOrchestrator {
  private promptEngine: PromptEngine;

  constructor() {
    this.promptEngine = new PromptEngine();
  }

  /**
   * Generate AI completion
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    // Validate request
    this.validateRequest(request);

    // Get provider (from registry or database)
    const provider = await this.getOrCreateProvider(request.providerId);

    // Check capability
    if (!provider.supportsCapability('chat')) {
      throw new ValidationError(
        `Provider ${provider.name} does not support text generation`
      );
    }

    // Build prompt
    const prompt = this.promptEngine.buildPrompt(request);
    const enhancedRequest = { ...request, text: prompt };

    logger.info(`Generating with provider: ${provider.name}, model: ${request.modelId}`);

    try {
      // Measure latency
      const startTime = Date.now();
      const response = await provider.generate(enhancedRequest);
      const latency = Date.now() - startTime;

      logger.info(`Generation completed in ${latency}ms`);

      return {
        ...response,
        latency,
      };
    } catch (error) {
      logger.error(`Generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate with streaming
   */
  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    // Validate request
    this.validateRequest(request);

    // Get provider (from registry or database)
    const provider = await this.getOrCreateProvider(request.providerId);

    // Check capability
    if (!provider.supportsCapability('streaming')) {
      throw new ValidationError(
        `Provider ${provider.name} does not support streaming`
      );
    }

    // Build prompt
    const prompt = this.promptEngine.buildPrompt(request);
    const enhancedRequest = { ...request, text: prompt };

    logger.info(`Streaming with provider: ${provider.name}, model: ${request.modelId}`);

    const startTime = Date.now();

    try {
      // Emit start event
      yield responseNormalizer.createStartChunk();

      // Stream from provider
      for await (const chunk of provider.stream(enhancedRequest)) {
        yield chunk;
      }

      // Emit complete event
      const latency = Date.now() - startTime;
      yield responseNormalizer.createCompleteChunk(undefined, latency);

      logger.info(`Streaming completed in ${latency}ms`);
    } catch (error) {
      logger.error(`Streaming failed: ${error}`);
      
      // Emit error event
      const errorMessage = error instanceof Error ? error.message : 'Streaming failed';
      yield responseNormalizer.createErrorChunk(errorMessage);
      
      throw error;
    }
  }

  /**
   * Grammar check operation
   */
  async checkGrammar(params: {
    text: string;
    language: string;
    providerId: string;
    modelId: string;
  }): Promise<AIResponse> {
    const prompt = this.promptEngine.buildGrammarPrompt(params.text, params.language);

    const request: AIRequest = {
      text: prompt,
      mode: 'standard',
      language: params.language,
      synonymLevel: 1,
      frozenTerms: [],
      providerId: params.providerId,
      modelId: params.modelId,
    };

    return this.generate(request);
  }

  /**
   * Humanize operation
   */
  async humanize(params: {
    text: string;
    mode: string;
    language: string;
    providerId: string;
    modelId: string;
  }): Promise<AIResponse> {
    const prompt = this.promptEngine.buildHumanizePrompt(params.text, params.mode, params.language);

    const request: AIRequest = {
      text: prompt,
      mode: 'humanize',
      language: params.language,
      synonymLevel: 2,
      frozenTerms: [],
      providerId: params.providerId,
      modelId: params.modelId,
    };

    return this.generate(request);
  }

  /**
   * Summarize operation
   */
  async summarize(params: {
    text: string;
    length: string;
    format: string;
    language: string;
    providerId: string;
    modelId: string;
  }): Promise<AIResponse> {
    const prompt = this.promptEngine.buildSummarizePrompt(
      params.text,
      params.length,
      params.format,
      params.language
    );

    const request: AIRequest = {
      text: prompt,
      mode: 'standard',
      language: params.language,
      synonymLevel: 1,
      frozenTerms: [],
      providerId: params.providerId,
      modelId: params.modelId,
    };

    return this.generate(request);
  }

  /**
   * Translate operation
   */
  async translate(params: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    providerId: string;
    modelId: string;
  }): Promise<AIResponse> {
    const prompt = this.promptEngine.buildTranslatePrompt(
      params.text,
      params.sourceLanguage,
      params.targetLanguage
    );

    const request: AIRequest = {
      text: prompt,
      mode: 'standard',
      language: params.targetLanguage,
      synonymLevel: 1,
      frozenTerms: [],
      providerId: params.providerId,
      modelId: params.modelId,
    };

    return this.generate(request);
  }

  /**
   * Generate citation
   */
  async generateCitation(params: {
    source: any;
    style: string;
    providerId: string;
    modelId: string;
  }): Promise<any> {
    const prompt = this.promptEngine.buildCitationPrompt(params.source, params.style);

    const request: AIRequest = {
      text: prompt,
      mode: 'standard',
      language: 'auto',
      synonymLevel: 1,
      frozenTerms: [],
      providerId: params.providerId,
      modelId: params.modelId,
    };

    const response = await this.generate(request);

    return {
      citation: response.text,
      inText: this.extractInTextCitation(response.text, params.style),
      style: params.style,
      provider: response.provider,
      model: response.model,
      latency: response.latency,
    };
  }

  /**
   * Extract in-text citation from full citation
   */
  private extractInTextCitation(citation: string, style: string): string {
    // Simple extraction - could be enhanced
    const match = citation.match(/\(([^)]+)\)/);
    return match ? match[1] : citation.split('.')[0];
  }

  /**
   * Validate AI request
   */
  private validateRequest(request: AIRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new ValidationError('Text is required');
    }

    if (request.text.length > 50000) {
      throw new ValidationError('Text exceeds maximum length of 50,000 characters');
    }

    if (!request.providerId) {
      throw new ValidationError('Provider ID is required');
    }

    if (!request.modelId) {
      throw new ValidationError('Model ID is required');
    }

    if (request.synonymLevel < 1 || request.synonymLevel > 4) {
      throw new ValidationError('Synonym level must be between 1 and 4');
    }
  }

  /**
   * Get or create a provider instance from database
   */
  private async getOrCreateProvider(providerId: string): Promise<IAIProvider> {
    // Check if already in registry
    if (providerRegistry.hasProvider(providerId)) {
      return providerRegistry.getProvider(providerId);
    }

    // Get provider from database
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundError(`Provider ${providerId}`);
    }

    // Get credentials
    const credentials = await prisma.providerCredentials.findUnique({
      where: { providerId: provider.id },
    });

    let apiKey: string | undefined;
    if (credentials?.encryptedApiKey) {
      apiKey = decrypt(
        credentials.encryptedApiKey,
        credentials.encryptionIv!,
        credentials.encryptionTag!
      );
    }

    // Create provider instance in registry
    const providerInstance = providerRegistry.createProvider({
      id: provider.id,
      type: provider.type,
      name: provider.name,
      baseUrl: provider.baseUrl || undefined,
      apiKey,
      modelId: provider.modelId || undefined,
      options: (provider.options as Record<string, unknown>) || {},
    });

    logger.info(`Loaded provider from database: ${provider.name} (${provider.type})`);

    return providerInstance;
  }
}

export const aiOrchestrator = new AIOrchestrator();
