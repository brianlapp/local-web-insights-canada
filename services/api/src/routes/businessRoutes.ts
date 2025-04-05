import { Router } from 'express';
import { param, query, body } from 'express-validator';
import * as businessController from '../controllers/businessController';
import { authenticateJWT, requireStandard } from '../middleware/authMiddleware';
import { validate, validatePagination, validateSorting } from '../middleware/validationMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';

const router = Router();

// Get all businesses with filters
router.get(
  '/',
  authenticateJWT,
  requireStandard,
  validatePagination,
  validateSorting(['name', 'rating', 'city', 'created_at', 'updated_at']),
  validate([
    query('name').optional().isString().withMessage('Name must be a string'),
    query('city').optional().isString().withMessage('City must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5'),
    query('maxRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Maximum rating must be between 0 and 5'),
    query('hasWebsite').optional().isBoolean().withMessage('hasWebsite must be a boolean')
  ]),
  asyncHandler(businessController.getAllBusinesses)
);

// Get business by ID
router.get(
  '/:id',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Business ID must be a valid UUID')
  ]),
  asyncHandler(businessController.getBusinessById)
);

// Get business insights
router.get(
  '/:id/insights',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Business ID must be a valid UUID')
  ]),
  asyncHandler(businessController.getBusinessInsights)
);

// Get business website audit data
router.get(
  '/:id/website-audit',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Business ID must be a valid UUID')
  ]),
  asyncHandler(businessController.getBusinessWebsiteAudit)
);

// Update business 
router.patch(
  '/:id',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Business ID must be a valid UUID'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('isMonitored').optional().isBoolean().withMessage('isMonitored must be a boolean')
  ]),
  asyncHandler(businessController.updateBusiness)
);

export default router; 