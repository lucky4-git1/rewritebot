import { randomUUID } from 'crypto';
import { logger } from '../config/logger';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Safe diagnostic logger that never logs sensitive data
 */
export class DiagnosticLogger {
  private requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }

  log(stage: string, data: Record<string, any>) {
    const safeData = this.sanitize(data);
    logger.info(`[${this.requestId}] ${stage}`, safeData);
  }

  error(stage: string, error: unknown, data?: Record<string, any>) {
    const safeData = data ? this.sanitize(data) : {};
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[${this.requestId}] ${stage} FAILED`, {
      ...safeData,
      error: errorMessage,
    });
  }

  /**
   * Remove sensitive data from logs
   */
  private sanitize(data: Record<string, any>): Record<string, any> {
    const safe: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Never log these fields
      if (
        key === 'apiKey' ||
        key === 'authorization' ||
        key === 'password' ||
        key === 'token' ||
        key === 'encryptedApiKey' ||
        key === 'encryptionIv' ||
        key === 'encryptionTag'
      ) {
        safe[key] = '[REDACTED]';
        continue;
      }

      // Log lengths instead of full content
      if (key === 'text' || key === 'content' || key === 'output' || key === 'input') {
        safe[`${key}Length`] = typeof value === 'string' ? value.length : 0;
        continue;
      }

      // Log prompt info without content
      if (key === 'prompt') {
        safe.promptLength = typeof value === 'string' ? value.length : 0;
        continue;
      }

      // Pass through safe values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        safe[key] = value;
      } else if (value === null || value === undefined) {
        safe[key] = value;
      } else if (Array.isArray(value)) {
        safe[key] = `[Array: ${value.length} items]`;
      } else if (typeof value === 'object') {
        safe[key] = '[Object]';
      }
    }

    return safe;
  }
}
