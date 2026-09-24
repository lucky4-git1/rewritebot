import { FastifyInstance } from 'fastify';
import { ToolsController } from './tools.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/rateLimit';

export async function toolsRoutes(fastify: FastifyInstance) {
  const controller = new ToolsController();

  // Set error handler
  fastify.setErrorHandler(errorHandler as any);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Grammar check
  fastify.post('/grammar', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.checkGrammar(request as any, reply);
  });

  // Humanize
  fastify.post('/humanize', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.humanize(request as any, reply);
  });

  // Summarize
  fastify.post('/summarize', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.summarize(request as any, reply);
  });

  // Translate
  fastify.post('/translate', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.translate(request as any, reply);
  });

  // Generate citation
  fastify.post('/cite', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.generateCitation(request as any, reply);
  });
}
