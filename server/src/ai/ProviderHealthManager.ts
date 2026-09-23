import { ProviderHealthStatus } from './types';
import { getRedisClient, RedisKeys } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Manages health status of AI providers
 */
export class ProviderHealthManager {
  private readonly HEALTH_TTL = 300; // 5 minutes

  /**
   * Record a successful provider call
   */
  async recordSuccess(providerId: string, latency: number): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = RedisKeys.providerHealth(providerId);

      // Get current health status
      const current = await this.getHealth(providerId);

      const updated: ProviderHealthStatus = {
        providerId,
        status: 'healthy',
        lastSuccess: new Date(),
        lastFailure: current?.lastFailure,
        failureCount: 0,
        averageLatency: current?.averageLatency
          ? (current.averageLatency * 0.8 + latency * 0.2) // Weighted average
          : latency,
        lastChecked: new Date(),
      };

      await redis.setex(key, this.HEALTH_TTL, JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to record provider success:', error);
    }
  }

  /**
   * Record a failed provider call
   */
  async recordFailure(providerId: string, error: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = RedisKeys.providerHealth(providerId);

      // Get current health status
      const current = await this.getHealth(providerId);

      const failureCount = (current?.failureCount || 0) + 1;

      // Determine status based on failure count
      let status: 'healthy' | 'degraded' | 'unavailable' = 'degraded';
      if (failureCount >= 5) {
        status = 'unavailable';
      } else if (failureCount >= 3) {
        status = 'degraded';
      }

      const updated: ProviderHealthStatus = {
        providerId,
        status,
        lastSuccess: current?.lastSuccess,
        lastFailure: new Date(),
        failureCount,
        averageLatency: current?.averageLatency,
        lastChecked: new Date(),
      };

      await redis.setex(key, this.HEALTH_TTL, JSON.stringify(updated));

      if (status === 'unavailable') {
        logger.warn(`Provider ${providerId} marked as unavailable after ${failureCount} failures`);
      }
    } catch (error) {
      logger.error('Failed to record provider failure:', error);
    }
  }

  /**
   * Get health status for a provider
   */
  async getHealth(providerId: string): Promise<ProviderHealthStatus | null> {
    try {
      const redis = getRedisClient();
      const key = RedisKeys.providerHealth(providerId);

      const data = await redis.get(key);
      if (!data) {
        return null;
      }

      const health = JSON.parse(data) as ProviderHealthStatus;

      // Convert date strings back to Date objects
      if (health.lastSuccess) {
        health.lastSuccess = new Date(health.lastSuccess);
      }
      if (health.lastFailure) {
        health.lastFailure = new Date(health.lastFailure);
      }
      health.lastChecked = new Date(health.lastChecked);

      return health;
    } catch (error) {
      logger.error('Failed to get provider health:', error);
      return null;
    }
  }

  /**
   * Check if provider is healthy
   */
  async isHealthy(providerId: string): Promise<boolean> {
    const health = await this.getHealth(providerId);
    return !health || health.status === 'healthy' || health.status === 'degraded';
  }

  /**
   * Reset health status for a provider
   */
  async resetHealth(providerId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = RedisKeys.providerHealth(providerId);
      await redis.del(key);
      logger.info(`Reset health status for provider: ${providerId}`);
    } catch (error) {
      logger.error('Failed to reset provider health:', error);
    }
  }

  /**
   * Get health status for all providers
   */
  async getAllHealth(): Promise<Map<string, ProviderHealthStatus>> {
    try {
      const redis = getRedisClient();
      const pattern = 'provider:health:*';
      const keys = await redis.keys(pattern);

      const healthMap = new Map<string, ProviderHealthStatus>();

      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const health = JSON.parse(data) as ProviderHealthStatus;

          // Convert date strings back to Date objects
          if (health.lastSuccess) {
            health.lastSuccess = new Date(health.lastSuccess);
          }
          if (health.lastFailure) {
            health.lastFailure = new Date(health.lastFailure);
          }
          health.lastChecked = new Date(health.lastChecked);

          healthMap.set(health.providerId, health);
        }
      }

      return healthMap;
    } catch (error) {
      logger.error('Failed to get all provider health:', error);
      return new Map();
    }
  }
}

export const providerHealthManager = new ProviderHealthManager();
