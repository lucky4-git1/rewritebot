import { apiClient } from './api';
import { AIResponse, AIChunk, ParaphraseInput } from '@rewritebot/shared';

class ParaphraseService {
  /**
   * Paraphrase text (non-streaming)
   */
  async paraphrase(input: ParaphraseInput, signal?: AbortSignal): Promise<AIResponse> {
    return apiClient.post<AIResponse>('/paraphrase', input, { signal });
  }

  /**
   * Paraphrase text with streaming
   */
  async *paraphraseStream(input: ParaphraseInput, signal?: AbortSignal): AsyncGenerator<AIChunk, void, unknown> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/paraphrase/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '')}`,
      },
      body: JSON.stringify(input),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const chunk = JSON.parse(data) as AIChunk;
              yield chunk;
            } catch (error) {
              console.error('Failed to parse SSE data:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const paraphraseService = new ParaphraseService();
