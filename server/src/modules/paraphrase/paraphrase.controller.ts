import { FastifyReply, FastifyRequest } from 'fastify';
import { ParaphraseService } from './paraphrase.service';
import { validateSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { paraphraseSchema, ParaphraseInput } from '@rewritebot/shared';
import { aiOrchestrator } from '../../ai/AIOrchestrator';
import { generateRequestId, DiagnosticLogger } from '../../utils/diagnostics';

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
    const requestId = generateRequestId();
    const diag = new DiagnosticLogger(requestId);

    diag.log('PARAPHRASE_REQUEST_RECEIVED', {
      hasBody: !!request.body,
      hasUser: !!request.user,
    });

    const userId = request.user!.id;
    
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

    const response = await this.paraphraseService.paraphrase(userId, input, requestId);

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
    const userId = request.user!.id;
    const input = validateSchema(paraphraseSchema, request.body) as ParaphraseInput;

    // Set headers for Server-Sent Events
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
      mode: input.mode,
      language: input.language,
      synonymLevel: input.synonymLevel,
      frozenTerms: input.frozenTerms,
      customInstruction: input.customInstruction,
      providerId: input.providerId,
      modelId: input.modelId,
      options: input.options,
    };

    try {
      // Stream chunks
      for await (const chunk of aiOrchestrator.stream(aiRequest)) {
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
