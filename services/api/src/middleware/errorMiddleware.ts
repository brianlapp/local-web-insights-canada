import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found middleware - handles 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 if no status code is set
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;
  
  // Log the error
  if (statusCode === 500) {
    logger.error(`Internal Error: ${err.message}`);
    logger.error(err.stack || 'No stack trace available');
  } else {
    logger.warn(`Error ${statusCode}: ${err.message}`);
  }
  
  // In production, only send operational error details
  const message = process.env.NODE_ENV === 'production' && !isOperational
    ? 'Server Error'
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Async handler to catch errors in async route handlers
 */
export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
}; 