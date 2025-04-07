import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(message: string, statusCode: number | string, details?: unknown) {
    super(message);
    this.statusCode = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
    this.isOperational = true;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found middleware - handles 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new ApiError('Not Found', 404));
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', err);

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'Internal Server Error';
  const details = err instanceof ApiError ? err.details : undefined;

  const response: ApiErrorResponse = {
    error: message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.details = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Async handler to catch errors in async route handlers
 */
export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
}; 