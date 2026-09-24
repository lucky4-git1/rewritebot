export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class ProviderError extends AppError {
  constructor(
    message: string,
    public provider: string,
    public retryable: boolean = false,
    details?: Record<string, unknown>,
    statusCode: number = 502,
    code: string = 'PROVIDER_ERROR'
  ) {
    super(statusCode, code, message, { provider, retryable, ...details });
    this.name = 'ProviderError';
  }
}

export class ProviderCredentialError extends AppError {
  constructor(
    message = 'Stored provider credentials could not be decrypted. Re-enter the provider API key.',
    details?: Record<string, unknown>
  ) {
    super(400, 'PROVIDER_CREDENTIAL_ERROR', message, details);
    this.name = 'ProviderCredentialError';
  }
}

export class ModelNotFoundError extends AppError {
  constructor(message = 'Selected model was not found or has been decommissioned.', details?: Record<string, unknown>) {
    super(400, 'MODEL_NOT_FOUND', message, details);
    this.name = 'ModelNotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
    this.name = 'RateLimitError';
  }
}

