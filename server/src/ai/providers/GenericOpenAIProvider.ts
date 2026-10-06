import { AIRequest, AIResponse, AIChunk, Model, ProviderCapability } from '@rewritebot/shared';
import { BaseProvider } from '../BaseProvider';
import { ProviderConfig, ConnectionTestResult } from '../types';
import { responseNormalizer } from '../ResponseNormalizer';
import OpenAI from 'openai';

/**
 * Generic OpenAI-compatible provider
 * Works with any API that follows OpenAI's interface
 * Including: OpenAI, Azure OpenAI, many local models, custom endpoints
 */
export class GenericOpenAIProvider extends BaseProvider {
  protected openai: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateConfig();

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.apiKey || 'local',
      baseURL: this.baseUrl,
      timeout: this.options.timeout || 120000, // 120 seconds for slow AI APIs
      maxRetries: 0, // We handle retries at a higher level
    });
  }

  protected requiresBaseUrl(): boolean {
    return true;
  }

  protected requiresApiKey(): boolean {
    // Some local endpoints don't require authentication
    return false;
  }

  protected getDefaultModel(): string {
    return this.modelId || 'gpt-3.5-turbo';
  }

  getCapabilities(): ProviderCapability[] {
    return ['chat', 'streaming'];
  }

  /**
   * Validate credentials by attempting a simple API call
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Try to list models as a validation check
      const response = await this.openai.models.list();
      return !!response.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test connection to the provider
   */
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const [_, latency] = await this.measureLatency(async () => {
        const response = await this.openai.models.list();
        return response.data;
      });

      return {
        success: true,
        latency,
        modelsAvailable: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<Model[]> {
    try {
      const response = await this.openai.models.list();

      return response.data.map((model) => ({
        providerId: this.id,
        modelId: model.id,
        displayName: model.id,
        contextWindow: undefined,
        capabilities: this.getCapabilities(),
        streamingSupported: true,
        visionSupported: false,
        structuredOutputSupported: false,
      }));
    } catch (error) {
      // If listing models fails, return empty array
      // User can manually specify model ID
      return [];
    }
  }

  /**
   * Resolve dynamic temperature scaled to synonym & structural intensity
   */
  protected resolveTemperature(request: AIRequest): number {
    if (request.options?.temperature !== undefined) {
      return request.options.temperature;
    }
    if (this.options.temperature !== undefined) {
      return this.options.temperature;
    }
    // Stealth human cadence & perplexity calibration:
    if (request.mode === 'humanize') {
      return 0.88;
    }
    const level = request.synonymLevel ?? 2;
    // Calibrated for optimal human perplexity and syntactic variety:
    // Level 1: 0.55 (clean light rewrite)
    // Level 2: 0.68 (QuillBot sweet spot - rich clause inversion and vocabulary)
    // Level 3: 0.78 (Dynamic clause restructure)
    // Level 4: 0.88 (Comprehensive humanized rewrite)
    const baseTemp = level === 1 ? 0.55 : level === 2 ? 0.68 : level === 3 ? 0.78 : 0.88;

    // In shorten mode, keep temperature slightly tighter to maintain high compression
    if (request.mode === 'shorten') {
      return Math.min(baseTemp, 0.55);
    }
    return baseTemp;
  }

  /**
   * Build OpenAI chat completion messages separating system instructions and user text
   */
  protected buildMessages(request: AIRequest): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }
    messages.push({
      role: 'user',
      content: request.text,
    });
    return messages;
  }

  /**
   * Generate completion
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const modelId = this.getModelId(request);
    const startTime = Date.now();
    const temperature = this.resolveTemperature(request);
    const messages = this.buildMessages(request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: modelId,
        messages,
        temperature,
        max_tokens: request.options?.maxTokens ?? this.options.maxTokens,
        top_p: request.options?.topP ?? (this.options.topP !== undefined ? this.options.topP : 0.95),
        frequency_penalty: request.options?.frequencyPenalty ?? 0.35,
        presence_penalty: request.options?.presencePenalty ?? 0.20,
        stream: false,
      });

      const latency = Date.now() - startTime;

      // Extract response text
      const text = completion.choices[0]?.message?.content || '';

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
    } catch (error) {
      throw this.handleHttpError(error);
    }
  }

  /**
   * Generate with streaming
   */
  async *stream(request: AIRequest): AsyncGenerator<AIChunk, void, unknown> {
    const modelId = this.getModelId(request);
    const temperature = this.resolveTemperature(request);
    const messages = this.buildMessages(request);

    try {
      const stream = await this.openai.chat.completions.create({
        model: modelId,
        messages,
        temperature,
        max_tokens: request.options?.maxTokens ?? this.options.maxTokens,
        top_p: request.options?.topP ?? (this.options.topP !== undefined ? this.options.topP : 0.95),
        frequency_penalty: request.options?.frequencyPenalty ?? 0.35,
        presence_penalty: request.options?.presencePenalty ?? 0.20,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;

        if (delta) {
          yield {
            type: 'token',
            content: delta,
          };
        }

        // Check for finish reason
        if (chunk.choices[0]?.finish_reason) {
          yield {
            type: 'complete',
          };
        }
      }
    } catch (error) {
      throw this.handleHttpError(error);
    }
  }
}

/**
 * Factory function to create GenericOpenAI provider instances
 */
export function createGenericOpenAIProvider(config: ProviderConfig): GenericOpenAIProvider {
  return new GenericOpenAIProvider(config);
}
