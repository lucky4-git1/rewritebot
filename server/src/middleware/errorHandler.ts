import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { errorResponse } from '../utils/response';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export async function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = request.id;

  // Log error (but not sensitive information)
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ requestId, error: error.message, code: error.code }, 'Application error');
    } else {
      logger.warn({ requestId, error: error.message, code: error.code }, 'Client error');
    }
  } else {
    logger.error({ requestId, error: error.message, stack: error.stack }, 'Unexpected error');
  }

  errorResponse(reply, error, requestId);
}
