import { Document, DocumentVersion } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { CreateDocumentInput, UpdateDocumentInput } from '@rewritebot/shared';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { parseQueryPagination } from '../../utils/validation';
import { logger } from '../../config/logger';

export class DocumentsService {
  /**
   * Get all documents for a user
   */
  async getUserDocuments(
    userId: string,
    query: Record<string, unknown>
  ): Promise<{ documents: Document[]; total: number }> {
    const { page, pageSize, skip } = parseQueryPagination(query);
    const archived = query.archived === 'true';
    const favorite = query.favorite === 'true';

    const where: any = {
      userId,
      isArchived: archived,
    };

    if (favorite) {
      where.isFavorite = true;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ]);

    return { documents, total };
  }

  /**
   * Get a specific document
   */
  async getDocument(documentId: string, userId: string): Promise<Document> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.userId !== userId) {
      throw new ForbiddenError('You do not have access to this document');
    }

    return document;
  }

  /**
   * Create a new document
   */
  async createDocument(userId: string, input: CreateDocumentInput): Promise<Document> {
    const document = await prisma.document.create({
      data: {
        userId,
        title: input.title,
        content: input.content || '',
        isFavorite: false,
        isArchived: false,
      },
    });

    logger.info(`User ${userId} created document: ${document.title}`);

    return document;
  }

  /**
   * Update a document
   */
  async updateDocument(
    documentId: string,
    userId: string,
    input: UpdateDocumentInput
  ): Promise<Document> {
    // Check ownership
    await this.getDocument(documentId, userId);

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: input.title,
        content: input.content,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived,
      },
    });

    return document;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    // Check ownership
    const document = await this.getDocument(documentId, userId);

    // Delete document (cascade will delete versions)
    await prisma.document.delete({
      where: { id: documentId },
    });

    logger.info(`User ${userId} deleted document: ${document.title}`);
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(
    documentId: string,
    userId: string
  ): Promise<DocumentVersion[]> {
    // Check ownership
    await this.getDocument(documentId, userId);

    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 versions
    });

    return versions;
  }

  /**
   * Get a specific version
   */
  async getDocumentVersion(
    versionId: string,
    userId: string
  ): Promise<DocumentVersion> {
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!version) {
      throw new NotFoundError('Document version');
    }

    if (version.document.userId !== userId) {
      throw new ForbiddenError('You do not have access to this version');
    }

    return version;
  }

  /**
   * Get favorite documents
   */
  async getFavorites(userId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: {
        userId,
        isFavorite: true,
        isArchived: false,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Search documents
   */
  async searchDocuments(userId: string, query: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: {
        userId,
        isArchived: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }
}
