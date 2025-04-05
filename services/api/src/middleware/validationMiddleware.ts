import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from './errorMiddleware';

/**
 * Middleware to validate request data using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format error messages
    const extractedErrors: Record<string, string> = {};
    errors.array().forEach(err => {
      if ('path' in err && 'msg' in err) {
        extractedErrors[err.path] = err.msg;
      }
    });

    // Return validation error response
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: extractedErrors
    });
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Enforce limits
  if (page < 1) {
    return next(new ApiError(400, 'Page must be greater than 0'));
  }

  if (limit < 1 || limit > 100) {
    return next(new ApiError(400, 'Limit must be between 1 and 100'));
  }

  // Set validated values
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};

/**
 * Validate sorting parameters
 */
export const validateSorting = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    // Check sort field if provided
    if (sortBy && !allowedFields.includes(sortBy)) {
      return next(
        new ApiError(
          400, 
          `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
        )
      );
    }

    // Check sort order if provided
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      return next(
        new ApiError(
          400, 
          'Sort order must be "asc" or "desc"'
        )
      );
    }

    // Set default values if not provided
    if (!req.query.sortBy) {
      req.query.sortBy = 'created_at';
    }

    if (!req.query.sortOrder) {
      req.query.sortOrder = 'desc';
    }

    next();
  };
}; 