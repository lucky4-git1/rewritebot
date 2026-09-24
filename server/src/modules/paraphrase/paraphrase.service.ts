import { AIRequest, AIResponse, ParaphraseInput } from '@rewritebot/shared';
import { aiOrchestrator } from '../../ai/AIOrchestrator';
import { prisma } from '../../database/prisma';
import { calculateStatistics } from '../../utils/statistics';
import { providerHealthManager } from '../../ai/ProviderHealthManager';
import { logger } from '../../config/logger';
import { DiagnosticLogger } from '../../utils/diagnostics';

export class ParaphraseService {
  /**
   * Paraphrase text
   */
  async paraphrase(userId: string, input: ParaphraseInput, requestId: string): Promise<AIResponse> {
    const diag = new DiagnosticLogger(requestId);
    const startTime = Date.now();

    try {
      diag.log('PARAPHRASE_SERVICE_START', {
        userId,
        providerId: input.providerId,
        modelId: input.modelId,
      });

      // Create AI request with userId for security validation
      const aiRequest: AIRequest = {
        userId, // SECURITY: Validate provider ownership
        documentId: input.documentId,
        text: input.text,
        mode: input.mode as any,
        language: input.language,
        synonymLevel: input.synonymLevel,
        frozenTerms: input.frozenTerms,
        customInstruction: input.customInstruction,
        providerId: input.providerId,
        modelId: input.modelId,
        options: input.options,
      };

      diag.log('AI_REQUEST_CREATED', {
        mode: aiRequest.mode,
        language: aiRequest.language,
        synonymLevel: aiRequest.synonymLevel,
        frozenTermsCount: aiRequest.frozenTerms.length,
      });

      // Generate response
      const response = await aiOrchestrator.generate(aiRequest, requestId);

      diag.log('AI_RESPONSE_RECEIVED', {
        outputLength: response.text.length,
        provider: response.provider,
        model: response.model,
        latency: response.latency,
      });

      // Calculate statistics
      const statistics = calculateStatistics(input.text, response.text);

      // Record in history
      await this.recordHistory(userId, input, response, statistics, true);

      // Record success in health manager
      await providerHealthManager.recordSuccess(input.providerId, response.latency);

      logger.info(`Paraphrase completed for user ${userId}: ${statistics.inputWords} words`);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;

      diag.error('PARAPHRASE_SERVICE_FAILED', error, {
        userId,
        providerId: input.providerId,
        modelId: input.modelId,
        latency,
      });

      // Record failure in history
      const statistics = calculateStatistics(input.text, '');
      await this.recordHistory(
        userId,
        input,
        {
          text: '',
          provider: input.providerId,
          model: input.modelId,
          latency,
        },
        statistics,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Record failure in health manager
      await providerHealthManager.recordFailure(
        input.providerId,
        error instanceof Error ? error.message : 'Generation failed'
      );

      logger.error(`Paraphrase failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Record paraphrase in history
   */
  private async recordHistory(
    userId: string,
    input: ParaphraseInput,
    response: AIResponse,
    statistics: any,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.historyEvent.create({
        data: {
          userId,
          documentId: input.documentId,
          operation: 'paraphrase',
          mode: input.mode,
          providerId: input.providerId,
          modelId: input.modelId,
          input: input.text,
          output: response.text || '',
          statistics,
          latency: response.latency,
          success,
          errorMessage,
        },
      });

      // If associated with a document, create version
      if (input.documentId && success) {
        await prisma.documentVersion.create({
          data: {
            documentId: input.documentId,
            input: input.text,
            output: response.text,
            mode: input.mode,
            providerId: input.providerId,
            modelId: input.modelId,
            synonymLevel: input.synonymLevel,
            frozenTerms: input.frozenTerms,
            language: input.language,
            statistics,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to record history:', error);
      // Don't throw - history failure shouldn't break paraphrasing
    }
  }
}
