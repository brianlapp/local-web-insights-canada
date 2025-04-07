import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { ApiError } from './errorMiddleware';

/**
 * Middleware to validate request data using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    validateRequest(req, res, next);
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
    return next(new ApiError('Page must be greater than 0', 400));
  }

  if (limit < 1 || limit > 100) {
    return next(new ApiError('Limit must be between 1 and 100', 400));
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
          `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`,
          400
        )
      );
    }

    // Check sort order if provided
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      return next(
        new ApiError(
          'Sort order must be "asc" or "desc"',
          400
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

export interface ValidationErrorResponse {
  field: string;
  message: string;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: ValidationErrorResponse[] = errors.array().map((err: ValidationError) => ({
      field: err.param,
      message: err.msg,
    }));
    throw new ApiError('Validation Error', 400, formattedErrors);
  }
  next();
}; 