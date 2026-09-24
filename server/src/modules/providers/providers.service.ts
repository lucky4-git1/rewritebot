import { Provider, ProviderCredentials } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { encrypt, decrypt } from '../../security/crypto';
import { providerRegistry } from '../../ai/ProviderRegistry';
import { providerHealthManager } from '../../ai/ProviderHealthManager';
import { AddProviderInput, UpdateProviderInput } from '@rewritebot/shared';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../config/logger';

export class ProvidersService {
  /**
   * Get all providers for a user
   */
  async getUserProviders(userId: string): Promise<Provider[]> {
    return prisma.provider.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a specific provider
   */
  async getProvider(providerId: string, userId: string): Promise<Provider> {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundError('Provider');
    }

    if (provider.userId !== userId) {
      throw new ForbiddenError('You do not have access to this provider');
    }

    return provider;
  }

  /**
   * Add a new provider
   */
  async addProvider(userId: string, input: AddProviderInput): Promise<Provider> {
    // Validate provider type exists
    const metadata = providerRegistry.getProviderMetadata(input.type);
    if (!metadata) {
      throw new ValidationError(`Unknown provider type: ${input.type}`);
    }

    // Create provider record
    const provider = await prisma.provider.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        protocol: input.protocol,
        baseUrl: input.baseUrl,
        authenticationType: input.authenticationType,
        modelId: input.modelId,
        isDefault: false,
        connectionStatus: 'not-configured',
        options: input.options || {},
      },
    });

    // Store encrypted credentials if provided
    if (input.apiKey) {
      const { encrypted, iv, tag } = encrypt(input.apiKey);

      await prisma.providerCredentials.create({
        data: {
          providerId: provider.id,
          encryptedApiKey: encrypted,
          encryptionIv: iv,
          encryptionTag: tag,
        },
      });
    }

    // If this is the user's first provider, make it default
    const providerCount = await prisma.provider.count({
      where: { userId },
    });

    if (providerCount === 1) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { isDefault: true },
      });
      provider.isDefault = true;
    }

    logger.info(`User ${userId} added provider: ${provider.name} (${provider.type})`);

    return provider;
  }

  /**
   * Update a provider
   */
  async updateProvider(
    providerId: string,
    userId: string,
    input: UpdateProviderInput
  ): Promise<Provider> {
    // Check ownership
    await this.getProvider(providerId, userId);

    // If setting as default, unset other defaults
    if (input.isDefault === true) {
      await prisma.provider.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update provider
    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        name: input.name,
        modelId: input.modelId,
        isDefault: input.isDefault,
        options: input.options || undefined,
      },
    });

    // Remove from runtime registry to force re-creation with new config
    if (providerRegistry.hasProvider(providerId)) {
      providerRegistry.removeProvider(providerId);
    }

    logger.info(`User ${userId} updated provider: ${provider.name}`);

    return provider;
  }

  /**
   * Delete a provider
   */
  async deleteProvider(providerId: string, userId: string): Promise<void> {
    // Check ownership
    const provider = await this.getProvider(providerId, userId);

    // Delete provider (cascade will delete credentials)
    await prisma.provider.delete({
      where: { id: providerId },
    });

    // Remove from runtime registry
    if (providerRegistry.hasProvider(providerId)) {
      providerRegistry.removeProvider(providerId);
    }

    // Reset health
    await providerHealthManager.resetHealth(providerId);

    // If this was the default, set another as default
    if (provider.isDefault) {
      const remaining = await prisma.provider.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (remaining) {
        await prisma.provider.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    logger.info(`User ${userId} deleted provider: ${provider.name}`);
  }

  /**
   * Test provider connection
   */
  async testConnection(providerId: string, userId: string): Promise<{
    success: boolean;
    status: string;
    message: string;
    latency?: number;
    modelsAvailable?: boolean;
  }> {
    // Check ownership
    const provider = await this.getProvider(providerId, userId);

    try {
      // Get or create provider instance
      const providerInstance = await this.getOrCreateProviderInstance(provider);

      // Test connection
      const result = await providerInstance.testConnection();

      // Update connection status
      const status = result.success ? 'connected' : 'failed';
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          connectionStatus: status,
          lastTested: new Date(),
        },
      });

      // Record health
      if (result.success && result.latency) {
        await providerHealthManager.recordSuccess(providerId, result.latency);
      } else if (!result.success) {
        await providerHealthManager.recordFailure(providerId, result.error || 'Connection failed');
      }

      return {
        success: result.success,
        status,
        message: result.success ? 'Connection successful' : result.error || 'Connection failed',
        latency: result.latency,
        modelsAvailable: result.modelsAvailable,
      };
    } catch (error) {
      // Update status to failed
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          connectionStatus: 'failed',
          lastTested: new Date(),
        },
      });

      const message = error instanceof Error ? error.message : 'Connection test failed';
      await providerHealthManager.recordFailure(providerId, message);

      return {
        success: false,
        status: 'failed',
        message,
      };
    }
  }

  /**
   * Get available models for a provider
   */
  async getProviderModels(providerId: string, userId: string) {
    // Check ownership
    const provider = await this.getProvider(providerId, userId);

    try {
      // Get or create provider instance
      const providerInstance = await this.getOrCreateProviderInstance(provider);

      // List models
      const models = await providerInstance.listModels();

      return models;
    } catch (error) {
      logger.error(`Failed to list models for provider ${providerId}:`, error);
      return [];
    }
  }

  /**
   * Get provider metadata for all supported types
   */
  getProviderTypes() {
    return providerRegistry.getAllMetadata();
  }

  /**
   * Test provider with actual text generation
   * This validates that the provider can generate AI responses
   */
  async testGeneration(providerId: string, userId: string): Promise<{
    success: boolean;
    generatedText?: string;
    latency?: number;
    error?: string;
  }> {
    // Check ownership
    const provider = await this.getProvider(providerId, userId);

    try {
      // Get or create provider instance
      const providerInstance = await this.getOrCreateProviderInstance(provider);

      // Test with a simple generation request
      const testRequest = {
        text: 'Hello, world!',
        mode: 'standard' as const,
        language: 'en',
        synonymLevel: 2,
        frozenTerms: [],
        providerId: provider.id,
        modelId: provider.modelId || '',
        userId,
      };

      const startTime = Date.now();
      const response = await providerInstance.generate(testRequest);
      const latency = Date.now() - startTime;

      // Validate response
      if (!response.text || response.text.trim().length === 0) {
        throw new Error('Provider returned empty response');
      }

      logger.info(`Test generation successful for provider ${providerId}: ${latency}ms`);

      return {
        success: true,
        generatedText: response.text,
        latency,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation test failed';
      logger.error(`Test generation failed for provider ${providerId}:`, error);

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get or create a provider instance in the registry
   */
  private async getOrCreateProviderInstance(provider: Provider) {
    // Check if already in registry
    if (providerRegistry.hasProvider(provider.id)) {
      return providerRegistry.getProvider(provider.id);
    }

    // Get credentials
    const credentials = await prisma.providerCredentials.findUnique({
      where: { providerId: provider.id },
    });

    let apiKey: string | undefined;
    if (credentials?.encryptedApiKey) {
      apiKey = decrypt(
        credentials.encryptedApiKey,
        credentials.encryptionIv!,
        credentials.encryptionTag!
      );
    }

    // Create provider instance
    const providerInstance = providerRegistry.createProvider({
      id: provider.id,
      type: provider.type,
      name: provider.name,
      baseUrl: provider.baseUrl || undefined,
      apiKey,
      modelId: provider.modelId || undefined,
      options: (provider.options as Record<string, unknown>) || {},
    });

    return providerInstance;
  }
}
