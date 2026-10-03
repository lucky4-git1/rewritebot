import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { aiOrchestrator } from '../../ai/AIOrchestrator';
import { logger } from '../../config/logger';
import { calculateStatistics } from '../../utils/statistics';

// In-memory fast cache for plagiarism scan results (10 min TTL, max 200 items)
interface CachedPlagiarismResult {
  response: any;
  timestamp: number;
}
const PLAGIARISM_CACHE = new Map<string, CachedPlagiarismResult>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

interface GrammarInput {
  text: string;
  language?: string;
  providerId: string;
  modelId: string;
}

interface HumanizeInput {
  text: string;
  mode: 'natural' | 'academic' | 'casual' | 'professional' | 'conversational';
  language?: string;
  providerId: string;
  modelId: string;
}

interface SummarizeInput {
  text: string;
  length: 'short' | 'medium' | 'detailed';
  format: 'paragraph' | 'bullets' | 'key-points' | 'executive';
  language?: string;
  providerId: string;
  modelId: string;
}

interface TranslateInput {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  providerId: string;
  modelId: string;
}

interface PlagiarismInput {
  text: string;
  language?: string;
  providerId: string;
  modelId: string;
}

export class ToolsService {
  /**
   * Grammar check and correction
   */
  async checkGrammar(userId: string, input: GrammarInput) {
    const startTime = Date.now();

    try {
      const response = await aiOrchestrator.checkGrammar({
        text: input.text,
        language: input.language || 'en',
        providerId: input.providerId,
        modelId: input.modelId,
      });

      const latency = Date.now() - startTime;
      const stats = calculateStatistics(input.text, response.text);

      // Record in history
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'grammar',
          mode: 'grammar',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: response.text,
          success: true,
          latency,
          statistics: stats as any,
        },
      });

      logger.info(`Grammar check completed for user ${userId}`);

      return {
        correctedText: response.text,
        corrections: response.changes || [],
        provider: response.provider,
        model: response.model,
        latency: response.latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      // Record failure
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'grammar',
          mode: 'grammar',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Humanize - make text sound more natural and human-written
   */
  async humanize(userId: string, input: HumanizeInput) {
    const startTime = Date.now();

    try {
      const response = await aiOrchestrator.humanize({
        text: input.text,
        mode: input.mode,
        language: input.language || 'auto',
        providerId: input.providerId,
        modelId: input.modelId,
      });

      const latency = Date.now() - startTime;
      const stats = calculateStatistics(input.text, response.text);

      // Record in history
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'humanize',
          mode: input.mode || 'natural',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: response.text,
          success: true,
          latency,
          statistics: stats as any,
        },
      });

      logger.info(`Humanize completed for user ${userId}`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'humanize',
          mode: input.mode || 'natural',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Summarize - create concise summaries of text
   */
  async summarize(userId: string, input: SummarizeInput) {
    const startTime = Date.now();

    try {
      const response = await aiOrchestrator.summarize({
        text: input.text,
        length: input.length,
        format: input.format,
        language: input.language || 'auto',
        providerId: input.providerId,
        modelId: input.modelId,
      });

      const latency = Date.now() - startTime;
      const stats = calculateStatistics(input.text, response.text);

      // Record in history
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'summarize',
          mode: input.length || 'medium',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: response.text,
          success: true,
          latency,
          statistics: stats as any,
        },
      });

      logger.info(`Summarize completed for user ${userId}`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'summarize',
          mode: input.length || 'medium',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Translate - translate text between languages
   */
  async translate(userId: string, input: TranslateInput) {
    const startTime = Date.now();

    try {
      const response = await aiOrchestrator.translate({
        text: input.text,
        sourceLanguage: input.sourceLanguage || 'auto',
        targetLanguage: input.targetLanguage,
        providerId: input.providerId,
        modelId: input.modelId,
      });

      const latency = Date.now() - startTime;
      const stats = calculateStatistics(input.text, response.text);

      // Record in history
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'translate',
          mode: input.targetLanguage,
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: response.text,
          success: true,
          latency,
          statistics: stats as any,
        },
      });

      logger.info(`Translation completed for user ${userId}`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'translate',
          mode: input.targetLanguage,
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Generate citation - format citations in various styles
   */
  async generateCitation(
    userId: string,
    source: any,
    style: string,
    providerId: string,
    modelId: string
  ) {
    const startTime = Date.now();

    try {
      const response = await aiOrchestrator.generateCitation({
        source,
        style,
        providerId,
        modelId,
      });

      const latency = Date.now() - startTime;

      // Record in history
      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'cite',
          mode: style,
          providerId,
          modelId,
          input: JSON.stringify(source),
          output: response.citation,
          success: true,
          latency,
          statistics: {} as any,
        },
      });

      logger.info(`Citation generated for user ${userId}`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      await prisma.historyEvent.create({
        data: {
          userId,
          operation: 'cite',
          mode: style,
          providerId,
          modelId,
          input: JSON.stringify(source),
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Check plagiarism and originality
   */
  async checkPlagiarism(userId: string, input: PlagiarismInput) {
    const startTime = Date.now();

    // Fast-path: Check in-memory cache for identical normalized text/model/language
    const normalizedText = input.text.trim().replace(/\s+/g, ' ');
    const normalizedLang = (input.language || 'auto').toLowerCase().trim();
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${input.providerId}:${input.modelId}:${normalizedLang}:${normalizedText}`)
      .digest('hex');

    const cached = PLAGIARISM_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logger.info(`Plagiarism check in-memory cache hit for user ${userId} [${cacheKey.slice(0, 8)}]`);
      return {
        ...cached.response,
        latency: Math.max(5, Date.now() - startTime),
      };
    }

    try {
      const response = await aiOrchestrator.checkPlagiarism({
        text: input.text,
        providerId: input.providerId,
        modelId: input.modelId,
        language: input.language || 'auto',
      });

      const latency = Date.now() - startTime;
      const statistics = calculateStatistics(input.text, '');

      // Store in memory cache (evict oldest if limit reached)
      if (PLAGIARISM_CACHE.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = PLAGIARISM_CACHE.keys().next().value;
        if (oldestKey) PLAGIARISM_CACHE.delete(oldestKey);
      }
      PLAGIARISM_CACHE.set(cacheKey, { response, timestamp: Date.now() });

      // Asynchronously record in history (fire and forget)
      prisma.historyEvent.create({
        data: {
          userId,
          operation: 'plagiarism',
          mode: `${response.originalityScore}%-original`,
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: JSON.stringify({
            originalityScore: response.originalityScore,
            plagiarismScore: response.plagiarismScore,
            riskLevel: response.riskLevel,
            matchCount: response.matches.length,
            sourcesCount: response.sources.length,
          }),
          success: true,
          latency,
          statistics: statistics as any,
        },
      }).catch((err) => {
        logger.error('Failed to record plagiarism check history:', err);
      });

      logger.info(`Plagiarism check completed for user ${userId}, originality: ${response.originalityScore}%`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      prisma.historyEvent.create({
        data: {
          userId,
          operation: 'plagiarism',
          mode: 'failed',
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: '',
          success: false,
          latency,
          statistics: {} as any,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch((err) => {
        logger.error('Failed to record failed plagiarism check history:', err);
      });

      throw error;
    }
  }
}

export const toolsService = new ToolsService();
