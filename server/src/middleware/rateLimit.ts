import { FastifyRequest, FastifyReply } from 'fastify';
import { getRedisClient, RedisKeys } from '../config/redis';
import { RateLimitError } from '../utils/errors';
import { config } from '../config';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}

/**
 * Create a rate limiting middleware
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const maxRequests = options.maxRequests || config.rateLimit.maxRequests;
  const keyPrefix = options.keyPrefix || 'ratelimit';

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const redis = getRedisClient();

    // Determine identifier (user ID if authenticated, otherwise IP)
    const identifier = request.user?.id || request.ip;
    const key = `${keyPrefix}:${identifier}`;

    try {
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= maxRequests) {
        // Get TTL to inform user when they can retry
        const ttl = await redis.ttl(key);
        
        reply.header('X-RateLimit-Limit', maxRequests.toString());
        reply.header('X-RateLimit-Remaining', '0');
        reply.header('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());
        reply.header('Retry-After', ttl.toString());

        throw new RateLimitError(
          `Too many requests. Please try again in ${ttl} seconds.`
        );
      }

      // Increment counter
      if (count === 0) {
        // First request in window - set with expiry
        await redis.setex(key, Math.ceil(windowMs / 1000), '1');
      } else {
        // Increment existing counter
        await redis.incr(key);
      }

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', maxRequests.toString());
      reply.header('X-RateLimit-Remaining', (maxRequests - count - 1).toString());
      
      const ttl = await redis.ttl(key);
      reply.header('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      // If Redis fails, allow the request (fail open)
      request.log.error('Rate limit check failed:', error);
    }
  };
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyPrefix: 'auth',
});

export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: 'api',
});

export const aiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  keyPrefix: 'ai',
});

export const providerTestRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: 'provider-test',
});
