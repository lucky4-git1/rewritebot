import { FastifyReply, FastifyRequest } from 'fastify';
import { ToolsService } from './tools.service';
import { validateSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import {
  grammarCheckSchema,
  humanizeSchema,
  summarizeSchema,
  translateSchema,
} from '@rewritebot/shared';
import { z } from 'zod';

const citationSchema = z.object({
  source: z.object({
    type: z.enum(['book', 'article', 'website', 'journal', 'other']),
    title: z.string().min(1),
    authors: z.array(z.string()),
    year: z.number().optional(),
    publisher: z.string().optional(),
    url: z.string().url().optional(),
    doi: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    accessed: z.string().optional(),
  }),
  style: z.enum(['apa', 'mla', 'chicago', 'harvard', 'ieee', 'vancouver']),
  providerId: z.string().uuid(),
  modelId: z.string().min(1),
});

export class ToolsController {
  private toolsService: ToolsService;

  constructor() {
    this.toolsService = new ToolsService();
  }

  /**
   * Check grammar
   * POST /api/v1/tools/grammar
   */
  async checkGrammar(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const input = validateSchema(grammarCheckSchema, request.body);

    const result = await this.toolsService.checkGrammar(userId, input);

    successResponse(reply, result);
  }

  /**
   * Humanize text
   * POST /api/v1/tools/humanize
   */
  async humanize(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const input = validateSchema(humanizeSchema, request.body);

    const result = await this.toolsService.humanize(userId, input);

    successResponse(reply, result);
  }

  /**
   * Summarize text
   * POST /api/v1/tools/summarize
   */
  async summarize(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const input = validateSchema(summarizeSchema, request.body);

    const result = await this.toolsService.summarize(userId, input);

    successResponse(reply, result);
  }

  /**
   * Translate text
   * POST /api/v1/tools/translate
   */
  async translate(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const input = validateSchema(translateSchema, request.body);

    const result = await this.toolsService.translate(userId, input);

    successResponse(reply, result);
  }

  /**
   * Generate citation
   * POST /api/v1/tools/cite
   */
  async generateCitation(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const input = validateSchema(citationSchema, request.body);

    const result = await this.toolsService.generateCitation(
      userId,
      input.source,
      input.style,
      input.providerId,
      input.modelId
    );

    successResponse(reply, result);
  }
}
