/**
 * Custom error classes for application error handling
 * Provides structured error types for better error handling and debugging
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Authentication/Authorization error
 */
export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public fields?: Record<string, string[]>,
    details?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500, originalError);
    this.name = 'DatabaseError';
  }
}

/**
 * Server action error
 */
export class ServerActionError extends AppError {
  constructor(message: string, public action?: string, details?: unknown) {
    super(message, 'SERVER_ACTION_ERROR', 500, details);
    this.name = 'ServerActionError';
  }
}

/**
 * File upload error
 */
export class FileUploadError extends AppError {
  constructor(
    message: string = 'File upload failed',
    public fileType?: string,
    public fileSize?: number,
    details?: unknown
  ) {
    super(message, 'FILE_UPLOAD_ERROR', 400, details);
    this.name = 'FileUploadError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Helper function to convert unknown errors to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, error);
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    error
  );
}

/**
 * Helper function to get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

