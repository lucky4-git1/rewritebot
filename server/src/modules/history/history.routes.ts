import { FastifyInstance } from 'fastify';
import { HistoryController } from './history.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/rateLimit';

export async function historyRoutes(fastify: FastifyInstance) {
  const controller = new HistoryController();

  // Set error handler
  fastify.setErrorHandler(errorHandler);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get statistics (must be before /:id routes)
  fastify.get('/stats', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getStats(request, reply);
  });

  // Get recent history (must be before /:id routes)
  fastify.get('/recent', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getRecent(request, reply);
  });

  // List history
  fastify.get('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.listHistory(request, reply);
  });

  // Get specific history event
  fastify.get('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getHistoryEvent(request, reply);
  });

  // Delete specific history event
  fastify.delete('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.deleteHistoryEvent(request, reply);
  });

  // Clear all history
  fastify.delete('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.clearHistory(request, reply);
  });
}
