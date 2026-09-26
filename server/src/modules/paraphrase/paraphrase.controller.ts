import { FastifyReply, FastifyRequest } from 'fastify';
import { ParaphraseService } from './paraphrase.service';
import { validateSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { paraphraseSchema, ParaphraseInput } from '@rewritebot/shared';
import { aiOrchestrator } from '../../ai/AIOrchestrator';
import { DiagnosticLogger } from '../../utils/diagnostics';

export class ParaphraseController {
  private paraphraseService: ParaphraseService;

  constructor() {
    this.paraphraseService = new ParaphraseService();
  }

  /**
   * Paraphrase text
   * POST /api/v1/paraphrase
   */
  async paraphrase(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const requestId = request.id;
    const diag = new DiagnosticLogger(requestId as string);

    diag.log('PARAPHRASE_REQUEST_RECEIVED', {
      hasBody: !!request.body,
      hasUser: !!(request as any).user,
    });

    const userId = (request as any).user?.id;
    
    diag.log('AUTHENTICATION_PASSED', { userId });

    const input = validateSchema(paraphraseSchema, request.body);

    diag.log('REQUEST_VALIDATED', {
      providerId: input.providerId,
      modelId: input.modelId,
      mode: input.mode,
      language: input.language,
      synonymLevel: input.synonymLevel,
      textLength: input.text.length,
    });

    const abortController = new AbortController();
    request.raw.on('close', () => {
      if (!reply.raw.writableEnded) {
        abortController.abort();
      }
    });

    const response = await this.paraphraseService.paraphrase(
      userId,
      {
        ...input,
        language: input.language || 'auto',
        synonymLevel: input.synonymLevel ?? 2,
        frozenTerms: input.frozenTerms || [],
        options: {
          ...input.options,
          signal: abortController.signal,
        } as any,
      },
      requestId
    );

    diag.log('PARAPHRASE_SUCCESS', {
      outputLength: response.text.length,
      latency: response.latency,
      provider: response.provider,
      model: response.model,
    });

    successResponse(reply, response);
  }

  /**
   * Paraphrase with streaming
   * POST /api/v1/paraphrase/stream
   */
  async paraphraseStream(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const input = validateSchema(paraphraseSchema, request.body) as ParaphraseInput;

    const streamAbortController = new AbortController();
    request.raw.on('close', () => {
      if (!reply.raw.writableEnded) {
        streamAbortController.abort();
      }
    });

    // Set headers for Server-Sent Events
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    });

    // Create AI request with userId for security validation
    const aiRequest = {
      userId, // SECURITY: Validate provider ownership
      documentId: input.documentId,
      text: input.text,
      mode: input.mode as any,
      language: input.language || 'auto',
      synonymLevel: input.synonymLevel,
      frozenTerms: input.frozenTerms,
      customInstruction: input.customInstruction,
      providerId: input.providerId,
      modelId: input.modelId,
      options: {
        ...input.options,
        signal: streamAbortController.signal,
      } as any,
    };

    const requestId = request.id as string;

    try {
      // Stream chunks
      for await (const chunk of aiOrchestrator.stream(aiRequest, requestId)) {
        const eventData = JSON.stringify(chunk);
        reply.raw.write(`data: ${eventData}\n\n`);
      }

      // Close stream
      reply.raw.end();
    } catch (error) {
      const errorChunk = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Streaming failed',
      };
      reply.raw.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      reply.raw.end();
    }
  }
}
