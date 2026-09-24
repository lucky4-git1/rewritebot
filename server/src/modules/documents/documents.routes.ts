import { FastifyInstance } from 'fastify';
import { DocumentsController } from './documents.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/rateLimit';

export async function documentsRoutes(fastify: FastifyInstance) {
  const controller = new DocumentsController();

  // Set error handler
  fastify.setErrorHandler(errorHandler as any);

  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Search documents (must be before /:id routes)
  fastify.get('/search', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.searchDocuments(request as any, reply);
  });

  // Get favorites (must be before /:id routes)
  fastify.get('/favorites', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getFavorites(request as any, reply);
  });

  // List documents
  fastify.get('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.listDocuments(request as any, reply);
  });

  // Get specific document
  fastify.get('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getDocument(request as any, reply);
  });

  // Create document
  fastify.post('/', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.createDocument(request as any, reply);
  });

  // Update document
  fastify.patch('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.updateDocument(request as any, reply);
  });

  // Delete document
  fastify.delete('/:id', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.deleteDocument(request as any, reply);
  });

  // Get document versions
  fastify.get('/:id/versions', {
    preHandler: [apiRateLimit],
  }, async (request, reply) => {
    return controller.getVersions(request as any, reply);
  });
}
