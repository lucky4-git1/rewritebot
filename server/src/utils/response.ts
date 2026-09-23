import { FastifyReply } from 'fastify';
import { ApiResponse, ApiError } from '@rewritebot/shared';
import { AppError } from './errors';
import { nanoid } from 'nanoid';

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
  const id = requestId || nanoid(10);

  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      requestId: id,
      details: error.details,
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
    };

    reply.status(error.statusCode).send(response);
  } else {
    // Unexpected error
    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: id,
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
