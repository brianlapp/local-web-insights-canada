import { Router } from 'express';
import businessRoutes from './businessRoutes';
import analysisRoutes from './analysisRoutes';
import webhookRoutes from './webhookRoutes';
import { authenticateJWT, requireStandard } from '../middleware/authMiddleware';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Version route
router.get('/version', (req, res) => {
  res.status(200).json({
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Protected routes
router.get('/me', authenticateJWT, requireStandard, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

// Register all route groups
router.use('/businesses', businessRoutes);
router.use('/analyses', analysisRoutes);
router.use('/webhooks', webhookRoutes);

export default router; 