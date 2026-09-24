import { FastifyReply, FastifyRequest } from 'fastify';
import { DocumentsService } from './documents.service';
import { validateSchema } from '../../utils/validation';
import { successResponse, paginatedResponse } from '../../utils/response';
import { createDocumentSchema, updateDocumentSchema } from '@rewritebot/shared';

export class DocumentsController {
  private documentsService: DocumentsService;

  constructor() {
    this.documentsService = new DocumentsService();
  }

  /**
   * List documents
   * GET /api/v1/documents
   */
  async listDocuments(
    request: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const { documents, total } = await this.documentsService.getUserDocuments(
      userId,
      request.query
    );

    const page = parseInt(request.query?.page || '1');
    const pageSize = parseInt(request.query?.pageSize || '20');

    paginatedResponse(reply, documents, total, page, pageSize);
  }

  /**
   * Get a document
   * GET /api/v1/documents/:id
   */
  async getDocument(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const documentId = request.params.id;

    const document = await this.documentsService.getDocument(documentId, userId);

    successResponse(reply, document);
  }

  /**
   * Create a document
   * POST /api/v1/documents
   */
  async createDocument(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const input = validateSchema(createDocumentSchema, request.body);

    const document = await this.documentsService.createDocument(userId, {
      ...input,
      content: input.content || '',
    });

    successResponse(reply, document, 201);
  }

  /**
   * Update a document
   * PATCH /api/v1/documents/:id
   */
  async updateDocument(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const documentId = request.params.id;
    const input = validateSchema(updateDocumentSchema, request.body);

    const document = await this.documentsService.updateDocument(
      documentId,
      userId,
      input
    );

    successResponse(reply, document);
  }

  /**
   * Delete a document
   * DELETE /api/v1/documents/:id
   */
  async deleteDocument(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const documentId = request.params.id;

    await this.documentsService.deleteDocument(documentId, userId);

    successResponse(reply, { message: 'Document deleted successfully' });
  }

  /**
   * Get document versions
   * GET /api/v1/documents/:id/versions
   */
  async getVersions(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const documentId = request.params.id;

    const versions = await this.documentsService.getDocumentVersions(documentId, userId);

    successResponse(reply, versions);
  }

  /**
   * Get favorite documents
   * GET /api/v1/documents/favorites
   */
  async getFavorites(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;

    const documents = await this.documentsService.getFavorites(userId);

    successResponse(reply, documents);
  }

  /**
   * Search documents
   * GET /api/v1/documents/search?q=query
   */
  async searchDocuments(
    request: FastifyRequest<{ Querystring: { q: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const query = request.query?.q || '';

    const documents = await this.documentsService.searchDocuments(userId, query);

    successResponse(reply, documents);
  }
}
