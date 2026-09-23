import Redis from 'ioredis';
import { config } from './index';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      console.error('✗ Redis connection error:', error);
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected');
  }
}

export async function redisHealthCheck(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Redis key helpers
export const RedisKeys = {
  // Rate limiting
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  
  // Provider health
  providerHealth: (providerId: string) => `provider:health:${providerId}`,
  
  // Provider models cache
  providerModels: (providerId: string) => `provider:models:${providerId}`,
  
  // Session
  session: (sessionId: string) => `session:${sessionId}`,
  
  // Temporary generation state
  generation: (requestId: string) => `generation:${requestId}`,
};
