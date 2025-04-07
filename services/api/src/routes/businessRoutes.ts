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
  query('search').optional().trim(),
  query('industry').optional().trim(),
  query('location').optional().trim(),
  query('status').optional().isIn(['active', 'inactive', 'pending']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort_by').optional().isIn(['name', 'created_at', 'updated_at', 'status']),
  query('sort_order').optional().isIn(['asc', 'desc']),
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