import express from 'express';
import { authenticateJWT, requireAdmin, requireStandard } from '../middleware/authMiddleware';
import { 
  getBusinessAnalyticsSummary,
  getBusinessPerformance,
  getBusinessRecommendations,
  compareWithCompetitors
} from '../controllers/businessAnalyticsController';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validationMiddleware';

const router = express.Router();

/**
 * @route   GET /api/analytics/business/:id/summary
 * @desc    Get analytics summary for a business
 * @access  Standard users and above
 */
router.get(
  '/business/:id/summary',
  authenticateJWT,
  requireStandard,
  [param('id').isUUID().withMessage('Valid business ID is required')],
  validateRequest,
  getBusinessAnalyticsSummary
);

/**
 * @route   GET /api/analytics/business/:id/performance
 * @desc    Get detailed performance data for a business
 * @access  Standard users and above
 */
router.get(
  '/business/:id/performance',
  authenticateJWT,
  requireStandard,
  [
    param('id').isUUID().withMessage('Valid business ID is required'),
    query('timeframe')
      .optional()
      .isIn(['7days', '30days', '90days', '6months', '1year'])
      .withMessage('Timeframe must be one of: 7days, 30days, 90days, 6months, 1year')
  ],
  validateRequest,
  getBusinessPerformance
);

/**
 * @route   GET /api/analytics/business/:id/recommendations
 * @desc    Get recommendations for business improvements
 * @access  Standard users and above
 */
router.get(
  '/business/:id/recommendations',
  authenticateJWT,
  requireStandard,
  [param('id').isUUID().withMessage('Valid business ID is required')],
  validateRequest,
  getBusinessRecommendations
);

/**
 * @route   POST /api/analytics/business/:id/compare
 * @desc    Compare business with competitors
 * @access  Standard users and above
 */
router.post(
  '/business/:id/compare',
  authenticateJWT,
  requireStandard,
  [
    param('id').isUUID().withMessage('Valid business ID is required'),
    body('competitorIds')
      .optional()
      .isArray()
      .withMessage('Competitor IDs must be an array'),
    body('competitorIds.*')
      .optional()
      .isUUID()
      .withMessage('All competitor IDs must be valid UUIDs')
  ],
  validateRequest,
  compareWithCompetitors
);

export default router; 