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
    let resolvedProviderId = input.providerId || '';
    let resolvedModelId = input.modelId || '';

    try {
      diag.log('PARAPHRASE_SERVICE_START', {
        userId,
        providerId: input.providerId,
        modelId: input.modelId,
      });

      if (!resolvedProviderId || !resolvedModelId) {
        const defaultProvider =
          (await prisma.provider.findFirst({
            where: { isDefault: true },
          })) || (await prisma.provider.findFirst());

        if (defaultProvider) {
          resolvedProviderId = defaultProvider.id;
          resolvedModelId = defaultProvider.modelId || '';
        }
      }

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
        providerId: resolvedProviderId,
        modelId: resolvedModelId,
        plagiarismGuard: input.plagiarismGuard ?? true,
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

      // Record in history asynchronously (don't block user response)
      if (userId) {
        this.recordHistory(userId, { ...input, providerId: resolvedProviderId, modelId: resolvedModelId }, response, statistics, true).catch((err) => {
          logger.error('Background history recording failed:', err);
        });
      }

      // Record success in health manager asynchronously
      if (resolvedProviderId) {
        providerHealthManager.recordSuccess(resolvedProviderId, response.latency).catch((err) => {
          logger.warn('Background provider health recording failed:', err);
        });
      }

      logger.info(`Paraphrase completed for user ${userId || 'guest'}: ${statistics.inputWords} words`);

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
      if (userId && resolvedProviderId && resolvedModelId) {
        const statistics = calculateStatistics(input.text, '');
        await this.recordHistory(
          userId,
          input,
          {
            text: '',
            provider: resolvedProviderId,
            model: resolvedModelId,
            latency,
          },
          statistics,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      // Record failure in health manager
      if (resolvedProviderId) {
        await providerHealthManager.recordFailure(
          resolvedProviderId,
          error instanceof Error ? error.message : 'Generation failed'
        );
      }

      logger.error(`Paraphrase failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Record paraphrase in history
   */
  public async recordHistory(
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
          providerId: input.providerId || response.provider || '',
          modelId: input.modelId || response.model || '',
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
            providerId: input.providerId || response.provider || '',
            modelId: input.modelId || response.model || '',
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
