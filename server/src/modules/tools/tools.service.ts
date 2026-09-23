import { prisma } from '../../database/prisma';
import { aiOrchestrator } from '../../ai';
import { logger } from '../../config/logger';
import { 
  GrammarCheckInput, 
  HumanizeInput, 
  SummarizeInput, 
  TranslateInput 
} from '@rewritebot/shared';
import { calculateStatistics } from '../../utils/statistics';

export class ToolsService {
  /**
   * Grammar check - analyze and correct grammar, spelling, punctuation
   */
  async checkGrammar(userId: string, input: GrammarCheckInput) {
    const startTime = Date.now();

    try {
      // Use AIOrchestrator to perform grammar check
      const response = await aiOrchestrator.checkGrammar({
        text: input.text,
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
          operation: 'grammar',
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: response.text,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: '',
          success: false,
          latency,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: response.text,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: '',
          success: false,
          latency,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: response.text,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: '',
          success: false,
          latency,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: response.text,
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
          providerId: input.providerId,
          modelId: input.modelId,
          inputText: input.text,
          outputText: '',
          success: false,
          latency,
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
          providerId,
          modelId,
          inputText: JSON.stringify(source),
          outputText: response.citation,
          success: true,
          latency,
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
          providerId,
          modelId,
          inputText: JSON.stringify(source),
          outputText: '',
          success: false,
          latency,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }
}
