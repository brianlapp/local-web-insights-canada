import { Router } from 'express';
import { body, param } from 'express-validator';
import * as webhookController from '../controllers/webhookController';
import { authenticateJWT, requireAdmin, authenticateApiKey } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { asyncHandler } from '../middleware/errorMiddleware';

const router = Router();

// Register a new webhook
router.post(
  '/',
  authenticateJWT,
  requireAdmin,
  validate([
    body('name').isString().withMessage('Name is required'),
    body('url').isURL().withMessage('URL must be a valid URL'),
    body('events')
      .isArray({ min: 1 })
      .withMessage('At least one event is required'),
    body('events.*')
      .isIn([
        'business.created',
        'business.updated',
        'business.deleted',
        'analysis.created',
        'analysis.updated',
        'analysis.completed',
        'analysis.failed',
        'scraper.completed',
        'scraper.failed',
        'website_audit.completed',
        'website_audit.failed'
      ])
      .withMessage('Invalid event type'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    body('secret')
      .optional()
      .isString()
      .isLength({ min: 8 })
      .withMessage('Secret must be at least 8 characters')
  ]),
  asyncHandler(webhookController.registerWebhook)
);

// Get all webhooks
router.get(
  '/',
  authenticateJWT,
  requireAdmin,
  asyncHandler(webhookController.getAllWebhooks)
);

// Get webhook by ID
router.get(
  '/:id',
  authenticateJWT,
  requireAdmin,
  validate([
    param('id').isUUID().withMessage('Webhook ID must be a valid UUID')
  ]),
  asyncHandler(webhookController.getWebhookById)
);

// Update webhook
router.patch(
  '/:id',
  authenticateJWT,
  requireAdmin,
  validate([
    param('id').isUUID().withMessage('Webhook ID must be a valid UUID'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('url').optional().isURL().withMessage('URL must be a valid URL'),
    body('events')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one event is required'),
    body('events.*')
      .optional()
      .isIn([
        'business.created',
        'business.updated',
        'business.deleted',
        'analysis.created',
        'analysis.updated',
        'analysis.completed',
        'analysis.failed',
        'scraper.completed',
        'scraper.failed',
        'website_audit.completed',
        'website_audit.failed'
      ])
      .withMessage('Invalid event type'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    body('secret')
      .optional()
      .isString()
      .isLength({ min: 8 })
      .withMessage('Secret must be at least 8 characters')
  ]),
  asyncHandler(webhookController.updateWebhook)
);

// Delete webhook
router.delete(
  '/:id',
  authenticateJWT,
  requireAdmin,
  validate([
    param('id').isUUID().withMessage('Webhook ID must be a valid UUID')
  ]),
  asyncHandler(webhookController.deleteWebhook)
);

// Test webhook
router.post(
  '/:id/test',
  authenticateJWT,
  requireAdmin,
  validate([
    param('id').isUUID().withMessage('Webhook ID must be a valid UUID'),
    body('event')
      .isIn([
        'business.created',
        'business.updated',
        'business.deleted',
        'analysis.created',
        'analysis.updated',
        'analysis.completed',
        'analysis.failed',
        'scraper.completed',
        'scraper.failed',
        'website_audit.completed',
        'website_audit.failed'
      ])
      .withMessage('Invalid event type'),
    body('payload')
      .isObject()
      .withMessage('Payload must be an object')
  ]),
  asyncHandler(webhookController.testWebhook)
);

// Webhook delivery logs
router.get(
  '/:id/logs',
  authenticateJWT,
  requireAdmin,
  validate([
    param('id').isUUID().withMessage('Webhook ID must be a valid UUID')
  ]),
  asyncHandler(webhookController.getWebhookLogs)
);

// External webhook endpoint (used by external systems to trigger events)
router.post(
  '/external/:eventType',
  authenticateApiKey,
  validate([
    param('eventType').isString().withMessage('Event type is required'),
    body('payload').isObject().withMessage('Payload must be an object')
  ]),
  asyncHandler(webhookController.handleExternalWebhook)
);

export default router; 