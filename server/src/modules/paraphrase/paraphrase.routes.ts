import { FastifyInstance } from 'fastify';
import { ParaphraseController } from './paraphrase.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { aiRateLimit } from '../../middleware/rateLimit';

export async function paraphraseRoutes(fastify: FastifyInstance) {
  const controller = new ParaphraseController();

  // Set error handler
  fastify.setErrorHandler(errorHandler as any);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Paraphrase (non-streaming)
  fastify.post('/', {
    preHandler: [aiRateLimit],
  }, async (request, reply) => {
    return controller.paraphrase(request as any, reply);
  });

  // Paraphrase (streaming)
  fastify.post('/stream', {
    preHandler: [aiRateLimit],
  }, async (request, reply) => {
    return controller.paraphraseStream(request as any, reply);
  });
}
