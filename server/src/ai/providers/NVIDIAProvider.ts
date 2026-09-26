import { AIRequest, AIResponse, AIChunk } from '@rewritebot/shared';
import { ProviderConfig, ProviderMetadata } from '../types';
import { GenericOpenAIProvider } from './GenericOpenAIProvider';
import { config as appConfig } from '../../config';
import { logger } from '../../config/logger';

/**
 * NVIDIA AI provider
 * Supports both hosted NVIDIA API (https://integrate.api.nvidia.com/v1) and self-hosted NVIDIA NIM
 * Uses OpenAI-compatible chat completions interface with robust timeout, bounded max_tokens, and streaming.
 */
export class NVIDIAProvider extends GenericOpenAIProvider {
  private timeoutMs: number;
  private defaultMaxTokens: number;

  constructor(config: ProviderConfig) {
    // Set default base URL if not provided
    if (!config.baseUrl) {
      config.baseUrl = 'https://integrate.api.nvidia.com/v1';
    }

    // Resolve timeout from provider options or environment config (default 60000ms)
    const timeoutMs =
      (config.options?.timeout as number) ||
      appConfig.nvidia.timeoutMs ||
      60000;

    // Resolve max tokens from provider options or environment config (default 2048)
    const defaultMaxTokens =
      (config.options?.maxTokens as number) ||
      appConfig.nvidia.maxTokens ||
      2048;

    // Pass resolved timeout to GenericOpenAIProvider
    super({
      ...config,
      options: {
        ...config.options,
        timeout: timeoutMs,
      },
    });

    this.timeoutMs = timeoutMs;
    this.defaultMaxTokens = defaultMaxTokens;
  }

  protected requiresApiKey(): boolean {
    // NVIDIA hosted API requires an API key
    // Self-hosted NIM might not
    return this.baseUrl?.includes('nvidia.com') ?? true;
  }

  protected getDefaultModel(): string {
    return this.modelId || 'meta/llama-3.1-8b-instruct';
  }

  /**
   * Calculate bounded max_tokens to prevent unnecessarily large/infinite generation
   * while ensuring valid output is never truncated.
   */
  private calculateMaxTokens(request: AIRequest): number {
    if (request.options?.maxTokens) {
      return request.options.maxTokens;
    }

    const inputChars = request.text?.length || 0;
    // Estimate tokens (roughly 3.5 chars per token)
    const estimatedInputTokens = Math.max(Math.ceil(inputChars / 3.5), 1);
    
    // Paraphrased text is usually comparable to input; allow 1.5x with a minimum floor of 256
    const targetTokens = Math.max(Math.ceil(estimatedInputTokens * 1.5), 256);
    
    // Bound to configured upper limit
    return Math.min(targetTokens, this.defaultMaxTokens);
  }

  /**
   * Generate completion with configurable timeout, bounded max_tokens, and diagnostic logging
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const modelId = this.getModelId(request);
    const maxTokens = this.calculateMaxTokens(request);
    const timeout = (request.options?.timeout as number) || this.timeoutMs;
    const signal = (request.options?.signal as AbortSignal) || undefined;
    const startTime = Date.now();
    const requestId = (request as any).requestId || request.documentId || 'direct';

    const inputChars = request.text?.length || 0;
    const estTokens = Math.ceil(inputChars / 3.5);

    logger.info(
      `[NVIDIA] request=${requestId} model=${modelId} chars=${inputChars} tokens_est=${estTokens} max_tokens=${maxTokens} timeout=${timeout}ms streaming=false`
    );

    try {
      const completion = await this.openai.chat.completions.create(
        {
          model: modelId,
          messages: [
            {
              role: 'user',
              content: request.text,
            },
          ],
          temperature: request.options?.temperature ?? this.options.temperature ?? 0.7,
          max_tokens: maxTokens,
          top_p: request.options?.topP ?? this.options.topP,
          stream: false,
        },
        {
          timeout,
          signal,
        }
      );

      const latency = Date.now() - startTime;
      const text = completion.choices[0]?.message?.content || '';

      logger.info(
        `[NVIDIA] request=${requestId} completed duration=${(latency / 1000).toFixed(2)}s status=200 output_chars=${text.length}`
      );

      return {
        text: text.trim(),
        provider: this.type,
        model: modelId,
        latency,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      const errorCode = error?.code || error?.name || 'UNKNOWN';
      logger.error(
        `[NVIDIA] request=${requestId} failed duration=${(latency / 1000).toFixed(2)}s error=${errorCode} message=${error?.message}`
      );
      throw this.handleHttpError(error);
    }
  }

  /**
   * Generate with streaming with configurable timeout, bounded max_tokens, and diagnostic logging
   */
  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    const modelId = this.getModelId(request);
    const maxTokens = this.calculateMaxTokens(request);
    const timeout = (request.options?.timeout as number) || this.timeoutMs;
    const signal = (request.options?.signal as AbortSignal) || undefined;
    const startTime = Date.now();
    const requestId = (request as any).requestId || request.documentId || 'direct';

    const inputChars = request.text?.length || 0;
    const estTokens = Math.ceil(inputChars / 3.5);

    logger.info(
      `[NVIDIA] request=${requestId} model=${modelId} chars=${inputChars} tokens_est=${estTokens} max_tokens=${maxTokens} timeout=${timeout}ms streaming=true`
    );

    try {
      const stream = await this.openai.chat.completions.create(
        {
          model: modelId,
          messages: [
            {
              role: 'user',
              content: request.text,
            },
          ],
          temperature: request.options?.temperature ?? this.options.temperature ?? 0.7,
          max_tokens: maxTokens,
          top_p: request.options?.topP ?? this.options.topP,
          stream: true,
        },
        {
          timeout,
          signal,
        }
      );

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;

        if (delta) {
          yield {
            type: 'token',
            content: delta,
          };
        }

        if (chunk.choices[0]?.finish_reason) {
          yield {
            type: 'complete',
          };
        }
      }

      const latency = Date.now() - startTime;
      logger.info(
        `[NVIDIA] request=${requestId} streaming completed duration=${(latency / 1000).toFixed(2)}s status=200`
      );
    } catch (error: any) {
      const latency = Date.now() - startTime;
      const errorCode = error?.code || error?.name || 'UNKNOWN';
      logger.error(
        `[NVIDIA] request=${requestId} streaming failed duration=${(latency / 1000).toFixed(2)}s error=${errorCode} message=${error?.message}`
      );
      throw this.handleHttpError(error);
    }
  }
}

/**
 * Factory function to create NVIDIA provider instances
 */
export function createNVIDIAProvider(config: ProviderConfig): NVIDIAProvider {
  return new NVIDIAProvider(config);
}

/**
 * NVIDIA provider metadata
 */
export const nvidiaMetadata: ProviderMetadata = {
  type: 'nvidia',
  name: 'NVIDIA',
  protocol: 'openai',
  defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
  documentationUrl: 'https://docs.nvidia.com/ai-enterprise/',
  requiresApiKey: true,
  supportsLocalhost: true,
  capabilities: ['chat', 'streaming'],
};
