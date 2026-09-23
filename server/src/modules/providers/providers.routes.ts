import { FastifyInstance } from 'fastify';
import { ProvidersController } from './providers.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit, providerTestRateLimit } from '../../middleware/rateLimit';

export async function providersRoutes(fastify: FastifyInstance) {
  const controller = new ProvidersController();

  // Set error handler
  fastify.setErrorHandler(errorHandler);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get supported provider types (no auth required, moved before other routes)
  fastify.get('/types', {
    preHandler: [],
  }, async (request, reply) => {
    return controller.getProviderTypes(request, reply);
  });

  // List user's providers
  fastify.get('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.listProviders(request, reply);
  });

  // Get specific provider
  fastify.get('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getProvider(request, reply);
  });

  // Add new provider
  fastify.post('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.addProvider(request, reply);
  });

  // Update provider
  fastify.patch('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.updateProvider(request, reply);
  });

  // Delete provider
  fastify.delete('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.deleteProvider(request, reply);
  });

  // Test provider connection
  fastify.post('/:id/test', {
    preHandler: [providerTestRateLimit],
  }, async (request, reply) => {
    return controller.testConnection(request, reply);
  });

  // Get provider models
  fastify.get('/:id/models', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getModels(request, reply);
  });
}
