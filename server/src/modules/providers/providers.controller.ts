import { FastifyReply, FastifyRequest } from 'fastify';
import { ProvidersService } from './providers.service';
import { validateSchema } from '../../utils/validation';
import { successResponse, paginatedResponse } from '../../utils/response';
import { addProviderSchema, updateProviderSchema } from '@rewritebot/shared';
import { maskApiKey } from '../../security/crypto';

export class ProvidersController {
  private providersService: ProvidersService;

  constructor() {
    this.providersService = new ProvidersService();
  }

  /**
   * Get all providers for authenticated user
   * GET /api/v1/providers
   */
  async listProviders(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;

    const providers = await this.providersService.getUserProviders(userId);

    // Mask sensitive information
    const sanitized = providers.map((provider) => ({
      ...provider,
      options: undefined, // Don't expose options
    }));

    successResponse(reply, sanitized);
  }

  /**
   * Get a specific provider
   * GET /api/v1/providers/:id
   */
  async getProvider(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    const provider = await this.providersService.getProvider(providerId, userId);

    successResponse(reply, {
      ...provider,
      options: undefined,
    });
  }

  /**
   * Add a new provider
   * POST /api/v1/providers
   */
  async addProvider(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const input = validateSchema(addProviderSchema, request.body);

    const provider = await this.providersService.addProvider(userId, input);

    successResponse(
      reply,
      {
        ...provider,
        options: undefined,
      },
      201
    );
  }

  /**
   * Update a provider
   * PATCH /api/v1/providers/:id
   */
  async updateProvider(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;
    const input = validateSchema(updateProviderSchema, request.body);

    const provider = await this.providersService.updateProvider(
      providerId,
      userId,
      input
    );

    successResponse(reply, {
      ...provider,
      options: undefined,
    });
  }

  /**
   * Delete a provider
   * DELETE /api/v1/providers/:id
   */
  async deleteProvider(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    await this.providersService.deleteProvider(providerId, userId);

    successResponse(reply, { message: 'Provider deleted successfully' });
  }

  /**
   * Test provider connection
   * POST /api/v1/providers/:id/test
   */
  async testConnection(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    const result = await this.providersService.testConnection(providerId, userId);

    successResponse(reply, result);
  }

  /**
   * Get available models for a provider
   * GET /api/v1/providers/:id/models
   */
  async getModels(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    const models = await this.providersService.getProviderModels(providerId, userId);

    successResponse(reply, models);
  }

  /**
   * Get supported provider types
   * GET /api/v1/providers/types
   */
  async getProviderTypes(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const types = this.providersService.getProviderTypes();

    successResponse(reply, types);
  }

  /**
   * Test provider with actual text generation
   * POST /api/v1/providers/:id/test-generation
   */
  async testGeneration(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    const result = await this.providersService.testGeneration(providerId, userId);

    successResponse(reply, result);
  }

  /**
   * Test provider with actual paraphrase pipeline
   * POST /api/v1/providers/:id/test-paraphrase
   */
  async testParaphrase(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const providerId = request.params.id;

    const result = await this.providersService.testParaphrase(providerId, userId);

    successResponse(reply, result);
  }
}
