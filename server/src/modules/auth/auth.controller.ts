import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { validateSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '@rewritebot/shared';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    // Debug logging
    console.log('Register request body:', request.body);
    console.log('Register request headers:', request.headers);
    console.log('Register request content-type:', request.headers['content-type']);
    
    const input = validateSchema(registerSchema, request.body);

    const result = await this.authService.register(input);

    successResponse(reply, {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        createdAt: result.user.createdAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 201);
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const input = validateSchema(loginSchema, request.body);

    const result = await this.authService.login(input);

    successResponse(reply, {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        createdAt: result.user.createdAt,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refresh(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const input = validateSchema(refreshTokenSchema, request.body);

    const result = await this.authService.refreshAccessToken(input.refreshToken);

    successResponse(reply, {
      accessToken: result.accessToken,
    });
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const input = validateSchema(refreshTokenSchema, request.body);

    await this.authService.logout(input.refreshToken);

    successResponse(reply, {
      message: 'Logged out successfully',
    });
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // @ts-ignore - user is added by auth middleware
    const userId = request.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await this.authService.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    successResponse(reply, {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  }
}
