import { apiClient, API_BASE_URL } from './api';
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
    const streamUrl = `${API_BASE_URL.replace(/\/+$/, '')}/paraphrase/stream`;
    const token = apiClient.getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '');

    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(input),
      signal,
    });

    if (!response.ok) {
      let errMessage = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson?.error?.message) {
          errMessage = errJson.error.message;
        }
      } catch (e) {}
      throw new Error(errMessage);
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

        buffer += decoder.decode(value, { stream: true });

        // Split on SSE event boundary (\r\n\r\n or \n\n)
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const data = trimmed.replace(/^data:\s*/, '');
              try {
                const chunk = JSON.parse(data) as AIChunk;
                yield chunk;
              } catch (error) {
                console.error('Failed to parse SSE chunk:', error, data);
              }
            }
          }
        }
      }

      // Flush any trailing buffer data
      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.replace(/^data:\s*/, '');
            try {
              const chunk = JSON.parse(data) as AIChunk;
              yield chunk;
            } catch (error) {
              console.error('Failed to parse trailing SSE chunk:', error, data);
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
