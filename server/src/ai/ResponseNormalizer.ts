import { AIResponse, AIChunk, TokenUsage } from '@rewritebot/shared';

/**
 * Normalizes responses from different providers into a common format
 */
export class ResponseNormalizer {
  /**
   * Normalize a provider response to standard format
   */
  normalize(
    providerResponse: unknown,
    provider: string,
    model: string,
    latency: number
  ): AIResponse {
    // Try different response formats
    const text = this.extractText(providerResponse);
    const usage = this.extractUsage(providerResponse);

    return {
      text,
      provider,
      model,
      latency,
      usage,
    };
  }

  /**
   * Extract text content from provider response
   */
  private extractText(response: unknown): string {
    if (typeof response === 'string') {
      return response.trim();
    }

    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      // OpenAI format
      if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
        const choice = obj.choices[0] as Record<string, unknown>;
        if (choice.message && typeof choice.message === 'object') {
          const message = choice.message as Record<string, unknown>;
          if (typeof message.content === 'string') {
            return message.content.trim();
          }
        }
        if (typeof choice.text === 'string') {
          return choice.text.trim();
        }
      }

      // Direct content field
      if (typeof obj.content === 'string') {
        return obj.content.trim();
      }

      // Direct text field
      if (typeof obj.text === 'string') {
        return obj.text.trim();
      }

      // Anthropic format
      if (obj.completion && typeof obj.completion === 'string') {
        return obj.completion.trim();
      }

      // Gemini format
      if (obj.candidates && Array.isArray(obj.candidates) && obj.candidates.length > 0) {
        const candidate = obj.candidates[0] as Record<string, unknown>;
        if (candidate.output && typeof candidate.output === 'string') {
          return candidate.output.trim();
        }
        if (candidate.content && typeof candidate.content === 'object') {
          const content = candidate.content as Record<string, unknown>;
          if (content.parts && Array.isArray(content.parts) && content.parts.length > 0) {
            const part = content.parts[0] as Record<string, unknown>;
            if (typeof part.text === 'string') {
              return part.text.trim();
            }
          }
        }
      }
    }

    return '';
  }

  /**
   * Extract token usage from provider response
   */
  private extractUsage(response: unknown): TokenUsage | undefined {
    if (typeof response === 'object' && response !== null) {
      const obj = response as Record<string, unknown>;

      // OpenAI format
      if (obj.usage && typeof obj.usage === 'object' && obj.usage !== null) {
        const usage = obj.usage as Record<string, unknown>;
        return {
          promptTokens: typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : undefined,
          completionTokens:
            typeof usage.completion_tokens === 'number' ? usage.completion_tokens : undefined,
          totalTokens: typeof usage.total_tokens === 'number' ? usage.total_tokens : undefined,
        };
      }

      // Alternative format
      if (
        typeof obj.prompt_tokens === 'number' ||
        typeof obj.completion_tokens === 'number' ||
        typeof obj.total_tokens === 'number'
      ) {
        return {
          promptTokens:
            typeof obj.prompt_tokens === 'number' ? obj.prompt_tokens : undefined,
          completionTokens:
            typeof obj.completion_tokens === 'number' ? obj.completion_tokens : undefined,
          totalTokens: typeof obj.total_tokens === 'number' ? obj.total_tokens : undefined,
        };
      }
    }

    return undefined;
  }

  /**
   * Normalize streaming chunk
   */
  normalizeChunk(chunk: unknown, provider: string): AIChunk | null {
    if (typeof chunk === 'string') {
      return {
        type: 'token',
        content: chunk,
      };
    }

    if (typeof chunk === 'object' && chunk !== null) {
      const obj = chunk as Record<string, unknown>;

      // OpenAI streaming format
      if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
        const choice = obj.choices[0] as Record<string, unknown>;

        if (choice.finish_reason) {
          return {
            type: 'complete',
          };
        }

        if (choice.delta && typeof choice.delta === 'object') {
          const delta = choice.delta as Record<string, unknown>;
          if (typeof delta.content === 'string') {
            return {
              type: 'token',
              content: delta.content,
            };
          }
        }
      }

      // Direct content field
      if (typeof obj.content === 'string') {
        return {
          type: 'token',
          content: obj.content,
        };
      }

      // Token field
      if (typeof obj.token === 'string') {
        return {
          type: 'token',
          content: obj.token,
        };
      }

      // Done signal
      if (obj.done === true || obj.finished === true) {
        return {
          type: 'complete',
        };
      }
    }

    return null;
  }

  /**
   * Create a start chunk
   */
  createStartChunk(requestId?: string): AIChunk {
    return {
      type: 'start',
      metadata: requestId ? { requestId } : undefined,
    };
  }

  /**
   * Create a complete chunk
   */
  createCompleteChunk(usage?: TokenUsage, latency?: number): AIChunk {
    return {
      type: 'complete',
      metadata: {
        usage,
        latency,
      },
    };
  }

  /**
   * Create an error chunk
   */
  createErrorChunk(error: string): AIChunk {
    return {
      type: 'error',
      error,
    };
  }
}

export const responseNormalizer = new ResponseNormalizer();
