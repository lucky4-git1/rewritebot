import { FastifyInstance } from 'fastify';
import { HistoryController } from './history.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/rateLimit';

export async function historyRoutes(fastify: FastifyInstance) {
  const controller = new HistoryController();

  // Set error handler
  fastify.setErrorHandler(errorHandler as any);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get statistics (must be before /:id routes)
  fastify.get('/stats', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getStats(request as any, reply);
  });

  // Get recent history (must be before /:id routes)
  fastify.get('/recent', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getRecent(request as any, reply);
  });

  // List history
  fastify.get('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.listHistory(request as any, reply);
  });

  // Get specific history event
  fastify.get('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getHistoryEvent(request as any, reply);
  });

  // Delete specific history event
  fastify.delete('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.deleteHistoryEvent(request as any, reply);
  });

  // Clear all history
  fastify.delete('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.clearHistory(request as any, reply);
  });
}
