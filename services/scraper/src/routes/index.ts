
import express from 'express';
import Queue from 'bull';
import { logger } from '../utils/logger';
import dataProcessingRoutes from './dataProcessingRoutes';
import testRoutes from './testRoutes';

export function setupRoutes(
  scraperQueue: Queue.Queue,
  auditQueue: Queue.Queue,
  dataProcessingQueue?: Queue.Queue
) {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Grid search endpoints
  router.post('/search-grid', async (req, res) => {
    try {
      const { location, radius, searchTerm } = req.body;

      if (!location || !radius) {
        return res.status(400).json({ error: 'Location and radius are required' });
      }

      const job = await scraperQueue.add('search-grid', {
        location,
        radius,
        searchTerm: searchTerm || '',
      });

      res.json({ jobId: job.id, message: 'Grid search job added to queue' });
    } catch (error) {
      logger.error('Error adding grid search job:', error);
      res.status(500).json({ error: 'Failed to add grid search job to queue' });
    }
  });

  // Website audit endpoints
  router.post('/audit-website', async (req, res) => {
    try {
      const { businessId, url } = req.body;

      if (!businessId || !url) {
        return res.status(400).json({ error: 'Business ID and URL are required' });
      }

      const job = await auditQueue.add('audit-website', {
        businessId,
        url,
      });

      res.json({ jobId: job.id, message: 'Website audit job added to queue' });
    } catch (error) {
      logger.error('Error adding website audit job:', error);
      res.status(500).json({ error: 'Failed to add website audit job to queue' });
    }
  });

  // Add data processing routes
  router.use('/data-processing', dataProcessingRoutes);
  
  // Add test routes only in development or test environments
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_ROUTES === 'true') {
    router.use('/test', testRoutes);
  }

  // Queue status endpoints
  router.get('/queue-status', async (req, res) => {
    try {
      const [
        scraperActive,
        scraperWaiting,
        scraperCompleted,
        scraperFailed,
        auditActive,
        auditWaiting,
        auditCompleted,
        auditFailed,
        dataProcessingActive,
        dataProcessingWaiting,
        dataProcessingCompleted,
        dataProcessingFailed,
      ] = await Promise.all([
        scraperQueue.getActiveCount(),
        scraperQueue.getWaitingCount(),
        scraperQueue.getCompletedCount(),
        scraperQueue.getFailedCount(),
        auditQueue.getActiveCount(),
        auditQueue.getWaitingCount(),
        auditQueue.getCompletedCount(),
        auditQueue.getFailedCount(),
        dataProcessingQueue?.getActiveCount() || Promise.resolve(0),
        dataProcessingQueue?.getWaitingCount() || Promise.resolve(0),
        dataProcessingQueue?.getCompletedCount() || Promise.resolve(0),
        dataProcessingQueue?.getFailedCount() || Promise.resolve(0),
      ]);

      res.json({
        scraper: {
          active: scraperActive,
          waiting: scraperWaiting,
          completed: scraperCompleted,
          failed: scraperFailed,
        },
        audit: {
          active: auditActive,
          waiting: auditWaiting,
          completed: auditCompleted,
          failed: auditFailed,
        },
        dataProcessing: dataProcessingQueue ? {
          active: dataProcessingActive,
          waiting: dataProcessingWaiting,
          completed: dataProcessingCompleted,
          failed: dataProcessingFailed,
        } : null,
      });
    } catch (error) {
      logger.error('Error fetching queue status:', error);
      res.status(500).json({ error: 'Failed to fetch queue status' });
    }
  });

  return router;
}
