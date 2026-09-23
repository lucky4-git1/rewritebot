import { apiClient } from './api';
import { HistoryEvent, PaginatedResponse } from '@rewritebot/shared';

interface HistoryStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  byOperation: Record<string, number>;
  byProvider: Record<string, number>;
}

class HistoryService {
  async getHistory(page = 1, pageSize = 20, operation?: string): Promise<PaginatedResponse<HistoryEvent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (operation) {
      params.append('operation', operation);
    }
    
    return apiClient.get<PaginatedResponse<HistoryEvent>>(`/history?${params}`);
  }

  async getHistoryEvent(id: string): Promise<HistoryEvent> {
    return apiClient.get<HistoryEvent>(`/history/${id}`);
  }

  async deleteHistoryEvent(id: string): Promise<void> {
    return apiClient.delete(`/history/${id}`);
  }

  async clearHistory(): Promise<void> {
    return apiClient.delete('/history');
  }

  async getStats(): Promise<HistoryStats> {
    return apiClient.get<HistoryStats>('/history/stats');
  }

  async getRecent(): Promise<HistoryEvent[]> {
    return apiClient.get<HistoryEvent[]>('/history/recent');
  }
}

export const historyService = new HistoryService();
