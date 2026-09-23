import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { errorHandler } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { authRateLimit } from '../../middleware/rateLimit';

export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();
  
  // Inject fastify instance into controller's service
  controller['authService'].setFastifyInstance(fastify);

  // Set error handler for auth routes
  fastify.setErrorHandler(errorHandler);

  // Register (with rate limiting)
  fastify.post('/register', {
    preHandler: [authRateLimit],
  }, async (request, reply) => {
    return controller.register(request, reply);
  });

  // Login (with rate limiting)
  fastify.post('/login', {
    preHandler: [authRateLimit],
  }, async (request, reply) => {
    return controller.login(request, reply);
  });

  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    return controller.refresh(request, reply);
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    return controller.logout(request, reply);
  });

  // Get current user (requires authentication)
  fastify.get('/me', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    return controller.getCurrentUser(request, reply);
  });
}
