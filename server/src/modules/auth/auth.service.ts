import { User, Session } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../../security/password';
import { generateToken, hashValue } from '../../security/crypto';
import { UnauthorizedError, ConflictError, ValidationError } from '../../utils/errors';
import { RegisterInput, LoginInput } from '@rewritebot/shared';
import { config } from '../../config';
import { FastifyInstance } from 'fastify';

export class AuthService {
  private fastify?: FastifyInstance;

  setFastifyInstance(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        'Password does not meet security requirements',
        { errors: passwordValidation.errors }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        defaultMode: 'standard',
        defaultLanguage: 'en',
        defaultSynonymLevel: 2,
        autoSave: true,
        theme: 'light',
      },
    });

    // Generate tokens
    const refreshToken = generateToken(64);
    const refreshTokenHash = hashValue(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.passwordHash, input.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const refreshToken = generateToken(64);
    const refreshTokenHash = hashValue(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
  }> {
    const refreshTokenHash = hashValue(refreshToken);

    // Find valid session
    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(session.user);

    return { accessToken };
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashValue(refreshToken);

    // Delete session
    await prisma.session.deleteMany({
      where: {
        refreshTokenHash,
      },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: User): string {
    if (!this.fastify) {
      throw new Error('Fastify instance not set');
    }

    return this.fastify.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  }
}
