import { FastifyInstance } from 'fastify';
import { ProvidersController } from './providers.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit, providerTestRateLimit } from '../../middleware/rateLimit';

export async function providersRoutes(fastify: FastifyInstance) {
  const controller = new ProvidersController();

  // Set error handler
  fastify.setErrorHandler(errorHandler as any);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get supported provider types (no auth required, moved before other routes)
  fastify.get('/types', {
    preHandler: [],
  }, async (request, reply) => {
    return controller.getProviderTypes(request as any, reply);
  });

  // List user's providers
  fastify.get('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.listProviders(request as any, reply);
  });

  // Get specific provider
  fastify.get('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getProvider(request as any, reply);
  });

  // Add new provider
  fastify.post('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.addProvider(request as any, reply);
  });

  // Update provider
  fastify.patch('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.updateProvider(request as any, reply);
  });

  // Delete provider
  fastify.delete('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.deleteProvider(request as any, reply);
  });

  // Test provider connection
  fastify.post('/:id/test', {
    preHandler: [providerTestRateLimit],
  }, async (request, reply) => {
    return controller.testConnection(request as any, reply);
  });

  // Test provider with actual generation
  fastify.post('/:id/test-generation', {
    preHandler: [providerTestRateLimit],
  }, async (request, reply) => {
    return controller.testGeneration(request as any, reply);
  });

  // Test provider with full paraphrase pipeline
  fastify.post('/:id/test-paraphrase', {
    preHandler: [providerTestRateLimit],
  }, async (request, reply) => {
    return controller.testParaphrase(request as any, reply);
  });

  // Get provider models
  fastify.get('/:id/models', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getModels(request as any, reply);
  });
}
