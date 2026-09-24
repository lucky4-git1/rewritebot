import { FastifyReply } from 'fastify';
import { ApiResponse, ApiError } from '@rewritebot/shared';
import { randomUUID } from 'node:crypto';
import { AppError } from './errors';

export function successResponse<T>(reply: FastifyReply, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  reply.status(statusCode).send(response);
}

export function errorResponse(
  reply: FastifyReply,
  error: Error | AppError,
  requestId?: string
): void {
  const id = requestId || randomUUID();

  const isAppError = error instanceof AppError ||
    (typeof (error as any)?.statusCode === 'number' && typeof (error as any)?.code === 'string');

  if (isAppError) {
    const appErr = error as any;
    const apiError: ApiError = {
      code: appErr.code || 'ERROR',
      message: appErr.message || 'An error occurred',
      requestId: id,
      details: appErr.details,
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
    };

    reply.status(appErr.statusCode || 500).send(response);
  } else {
    // Unexpected error
    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: (error as Error)?.message || 'An unexpected error occurred',
      requestId: id,
      details: {
        rawMessage: (error as Error)?.message,
        stack: (error as Error)?.stack,
      },
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
    };

    reply.status(500).send(response);
  }
}

export function paginatedResponse<T>(
  reply: FastifyReply,
  items: T[],
  total: number,
  page: number,
  pageSize: number
): void {
  const response = {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    },
  };
  reply.status(200).send(response);
}
