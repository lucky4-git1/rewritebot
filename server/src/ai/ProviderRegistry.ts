import { IAIProvider, ProviderConfig, ProviderMetadata } from './types';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';

/**
 * Registry for managing AI provider instances
 */
export class ProviderRegistry {
  private providers: Map<string, IAIProvider> = new Map();
  private providerFactories: Map<string, (config: ProviderConfig) => IAIProvider> = new Map();
  private providerMetadata: Map<string, ProviderMetadata> = new Map();

  /**
   * Register a provider factory
   * @param type - Provider type (e.g., 'nvidia', 'ollama')
   * @param factory - Factory function to create provider instances
   * @param metadata - Provider metadata
   */
  registerProviderType(
    type: string,
    factory: (config: ProviderConfig) => IAIProvider,
    metadata: ProviderMetadata
  ): void {
    this.providerFactories.set(type, factory);
    this.providerMetadata.set(type, metadata);
    logger.info(`Registered provider type: ${type}`);
  }

  /**
   * Create and register a provider instance
   * @param config - Provider configuration
   * @returns created provider instance
   */
  createProvider(config: ProviderConfig): IAIProvider {
    const factory = this.providerFactories.get(config.type);

    if (!factory) {
      throw new Error(`Unknown provider type: ${config.type}`);
    }

    const provider = factory(config);
    this.providers.set(config.id, provider);
    logger.info(`Created provider instance: ${config.id} (${config.type})`);

    return provider;
  }

  /**
   * Get a provider by ID
   * @param providerId - Provider ID
   * @returns provider instance
   */
  getProvider(providerId: string): IAIProvider {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new NotFoundError(`Provider ${providerId}`);
    }

    return provider;
  }

  /**
   * Check if a provider exists
   */
  hasProvider(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  /**
   * Remove a provider
   */
  removeProvider(providerId: string): void {
    if (this.providers.delete(providerId)) {
      logger.info(`Removed provider: ${providerId}`);
    }
  }

  /**
   * Get all registered provider instances
   */
  getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get metadata for a provider type
   */
  getProviderMetadata(type: string): ProviderMetadata | undefined {
    return this.providerMetadata.get(type);
  }

  /**
   * Get all registered provider types
   */
  getProviderTypes(): string[] {
    return Array.from(this.providerFactories.keys());
  }

  /**
   * Get all provider metadata
   */
  getAllMetadata(): ProviderMetadata[] {
    return Array.from(this.providerMetadata.values());
  }

  /**
   * Clear all providers (useful for testing)
   */
  clear(): void {
    this.providers.clear();
    logger.info('Cleared all provider instances');
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
