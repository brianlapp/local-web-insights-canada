import { Router } from 'express';
import { param, query, body } from 'express-validator';
import * as analysisController from '../controllers/analysisController';
import { authenticateJWT, requireStandard } from '../middleware/authMiddleware';
import { validate, validatePagination, validateSorting } from '../middleware/validationMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';

const router = Router();

// Get all analyses with filters
router.get(
  '/',
  authenticateJWT,
  requireStandard,
  validatePagination,
  validateSorting(['name', 'created_at', 'updated_at', 'status']),
  validate([
    query('name').optional().isString().withMessage('Name must be a string'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid status'),
    query('type').optional().isIn(['competitor', 'trend', 'custom']).withMessage('Invalid type'),
    query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid ISO date'),
    query('dateTo').optional().isISO8601().withMessage('Date to must be a valid ISO date')
  ]),
  asyncHandler(analysisController.getAllAnalyses)
);

// Get analysis by ID
router.get(
  '/:id',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Analysis ID must be a valid UUID')
  ]),
  asyncHandler(analysisController.getAnalysisById)
);

// Create a new analysis
router.post(
  '/',
  authenticateJWT,
  requireStandard,
  validate([
    body('name').isString().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('type').isIn(['competitor', 'trend', 'custom']).withMessage('Invalid type'),
    body('parameters').isObject().withMessage('Parameters must be an object'),
    body('businessIds').optional().isArray().withMessage('Business IDs must be an array'),
    body('businessIds.*').optional().isUUID().withMessage('Each business ID must be a valid UUID')
  ]),
  asyncHandler(analysisController.createAnalysis)
);

// Update analysis
router.patch(
  '/:id',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Analysis ID must be a valid UUID'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isIn(['paused', 'cancelled']).withMessage('Status can only be updated to paused or cancelled')
  ]),
  asyncHandler(analysisController.updateAnalysis)
);

// Get analysis results
router.get(
  '/:id/results',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Analysis ID must be a valid UUID')
  ]),
  asyncHandler(analysisController.getAnalysisResults)
);

// Re-run analysis
router.post(
  '/:id/rerun',
  authenticateJWT,
  requireStandard,
  validate([
    param('id').isUUID().withMessage('Analysis ID must be a valid UUID'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object')
  ]),
  asyncHandler(analysisController.rerunAnalysis)
);

export default router; 