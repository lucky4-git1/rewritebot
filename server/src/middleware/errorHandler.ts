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
  const isAppError = error instanceof AppError ||
    (typeof (error as any)?.statusCode === 'number' && typeof (error as any)?.code === 'string');

  if (isAppError) {
    const appErr = error as any;
    if (appErr.statusCode >= 500) {
      logger.error({ requestId, error: appErr.message, code: appErr.code }, 'Application error');
    } else {
      logger.warn({ requestId, error: appErr.message, code: appErr.code }, 'Client error');
    }
  } else {
    logger.error({ requestId, error: error.message, stack: error.stack }, 'Unexpected error');
  }

  errorResponse(reply, error, requestId);
}
