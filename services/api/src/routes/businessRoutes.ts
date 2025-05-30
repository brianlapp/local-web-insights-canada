import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();
const businessController = new BusinessController();

// Validation middleware
const createBusinessValidation = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('website_url').isURL(),
  body('industry').notEmpty().trim(),
  body('location').notEmpty().trim(),
];

const updateBusinessValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('website_url').optional().isURL(),
  body('industry').optional().trim(),
  body('location').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'pending']),
];

const queryParamsValidation = [
  // Text search
  query('search').optional().trim(),
  
  // Exact match filters
  query('industry').optional().trim(),
  query('location').optional().trim(),
  query('status').optional().isIn(['active', 'inactive', 'pending']),
  
  // Date filters
  query('created_after').optional().isISO8601().withMessage('created_after must be a valid ISO date'),
  query('created_before').optional().isISO8601().withMessage('created_before must be a valid ISO date'),
  query('updated_after').optional().isISO8601().withMessage('updated_after must be a valid ISO date'),
  query('updated_before').optional().isISO8601().withMessage('updated_before must be a valid ISO date'),
  
  // Field existence filters
  query('has_website').optional().isBoolean().withMessage('has_website must be true or false'),
  query('has_email').optional().isBoolean().withMessage('has_email must be true or false'),
  
  // Pagination
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  
  // Sorting
  query('sort_by').optional().isIn([
    'name', 'created_at', 'updated_at', 'status', 'industry', 
    'city', 'state', 'website', 'email'
  ]).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order must be asc or desc'),
];

// Routes
router.post(
  '/',
  authenticateJWT,
  createBusinessValidation,
  validateRequest,
  businessController.createBusiness
);

router.get(
  '/',
  authenticateJWT,
  queryParamsValidation,
  validateRequest,
  businessController.listBusinesses
);

router.get(
  '/:id',
  authenticateJWT,
  param('id').isUUID(),
  validateRequest,
  businessController.getBusiness
);

router.put(
  '/:id',
  authenticateJWT,
  requireAdmin,
  param('id').isUUID(),
  updateBusinessValidation,
  validateRequest,
  businessController.updateBusiness
);

router.delete(
  '/:id',
  authenticateJWT,
  requireAdmin,
  param('id').isUUID(),
  validateRequest,
  businessController.deleteBusiness
);

router.get(
  '/:id/analytics',
  authenticateJWT,
  param('id').isUUID(),
  validateRequest,
  businessController.getBusinessAnalytics
);

export default router; 