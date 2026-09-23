import { apiClient } from './api';
import { Document, DocumentVersion, CreateDocumentInput, UpdateDocumentInput, PaginatedResponse } from '@rewritebot/shared';

class DocumentsService {
  async getDocuments(page = 1, pageSize = 20, archived = false): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      archived: archived.toString(),
    });
    return apiClient.get<PaginatedResponse<Document>>(`/documents?${params}`);
  }

  async getDocument(id: string): Promise<Document> {
    return apiClient.get<Document>(`/documents/${id}`);
  }

  async createDocument(data: CreateDocumentInput): Promise<Document> {
    return apiClient.post<Document>('/documents', data);
  }

  async updateDocument(id: string, data: UpdateDocumentInput): Promise<Document> {
    return apiClient.patch<Document>(`/documents/${id}`, data);
  }

  async deleteDocument(id: string): Promise<void> {
    return apiClient.delete(`/documents/${id}`);
  }

  async getVersions(id: string): Promise<DocumentVersion[]> {
    return apiClient.get<DocumentVersion[]>(`/documents/${id}/versions`);
  }

  async getFavorites(): Promise<Document[]> {
    return apiClient.get<Document[]>('/documents/favorites');
  }

  async searchDocuments(query: string): Promise<Document[]> {
    return apiClient.get<Document[]>(`/documents/search?q=${encodeURIComponent(query)}`);
  }
}

export const documentsService = new DocumentsService();
