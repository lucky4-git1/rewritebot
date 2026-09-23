import { FastifyInstance } from 'fastify';
import { ToolsController } from './tools.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/rateLimit';

export async function toolsRoutes(fastify: FastifyInstance) {
  const controller = new ToolsController();

  // Set error handler
  fastify.setErrorHandler(errorHandler);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Grammar check
  fastify.post('/grammar', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.checkGrammar(request, reply);
  });

  // Humanize
  fastify.post('/humanize', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.humanize(request, reply);
  });

  // Summarize
  fastify.post('/summarize', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.summarize(request, reply);
  });

  // Translate
  fastify.post('/translate', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.translate(request, reply);
  });

  // Generate citation
  fastify.post('/cite', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.generateCitation(request, reply);
  });
}
