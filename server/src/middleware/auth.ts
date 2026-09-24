import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors';
import { AuthService } from '../modules/auth/auth.service';

// Extend @fastify/jwt to type request.user and JWT payload
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      id: string;
      email: string;
      name: string;
    };
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization token provided');
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token using Fastify JWT
    const decoded = (await request.jwtVerify()) as any;

    // Attach user to request
    request.user = {
      id: (decoded.sub || decoded.id) as string,
      email: decoded.email as string,
      name: decoded.name as string,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Optional authentication middleware
 * Doesn't throw error if no token, but attaches user if valid token provided
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await authenticate(request, reply);
  } catch (error) {
    // Ignore authentication errors
    (request as any).user = undefined;
  }
}
