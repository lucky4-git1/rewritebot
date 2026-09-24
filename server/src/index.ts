import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase, healthCheck } from './database/prisma';
import { getRedisClient, disconnectRedis, redisHealthCheck } from './config/redis';
import { authRoutes } from './modules/auth/auth.routes';
import { providersRoutes } from './modules/providers/providers.routes';
import { paraphraseRoutes } from './modules/paraphrase/paraphrase.routes';
import { documentsRoutes } from './modules/documents/documents.routes';
import { historyRoutes } from './modules/history/history.routes';
import { toolsRoutes } from './modules/tools/tools.routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeProviders } from './ai/initProviders';

const server = Fastify({
  logger: logger as any,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  disableRequestLogging: false,
  bodyLimit: 10485760, // 10MB
});

// Global error handler
server.setErrorHandler(errorHandler as any);

// Register plugins
async function registerPlugins() {
  // Security
  await server.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS
  await server.register(cors, {
    origin: config.app.corsOrigin,
    credentials: true,
  });

  // JWT
  await server.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });
}

// Register routes
async function registerRoutes() {
  // API v1 routes
  await server.register(
    async (fastify) => {
      // Auth routes
      await fastify.register(authRoutes, { prefix: '/auth' });

      // Provider routes
      await fastify.register(providersRoutes, { prefix: '/providers' });

      // Paraphrase routes
      await fastify.register(paraphraseRoutes, { prefix: '/paraphrase' });

      // Document routes
      await fastify.register(documentsRoutes, { prefix: '/documents' });

      // History routes
      await fastify.register(historyRoutes, { prefix: '/history' });

      // Tools routes
      await fastify.register(toolsRoutes, { prefix: '/tools' });

      // Health check for API
      fastify.get('/health', async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }));
    },
    { prefix: '/api/v1' }
  );
}

// Health check endpoint
server.get('/health', async (request, reply) => {
  const dbHealth = await healthCheck();
  const redisHealth = await redisHealthCheck();

  const isHealthy = dbHealth && redisHealth;

  return reply.status(isHealthy ? 200 : 503).send({
    status: isHealthy ? 'healthy' : 'unhealthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth ? 'up' : 'down',
      redis: redisHealth ? 'up' : 'down',
    },
  });
});

// Root endpoint
server.get('/', async (request, reply) => {
  return {
    name: 'RewriteBot API',
    version: '1.0.0',
    status: 'running',
  };
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown...`);

  try {
    await server.close();
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function start() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Redis
    getRedisClient();

    // Initialize AI providers
    initializeProviders();

    // Register plugins
    await registerPlugins();

    // Register routes
    await registerRoutes();

    // Start listening
    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Server running on ${config.app.apiUrl}`);
    logger.info(`📝 Environment: ${config.env}`);
    logger.info(`📚 API Documentation: ${config.app.apiUrl}/api/v1`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
