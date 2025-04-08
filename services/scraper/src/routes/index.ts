
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

  // New endpoint for starting the scraper from the admin panel
  router.post('/scraper/start', async (req, res) => {
    try {
      const { location, jobId } = req.body;

      if (!location) {
        return res.status(400).json({ error: 'Location is required' });
      }

      // Default radius for Ottawa (in meters)
      const radius = 10000;

      const job = await scraperQueue.add('search-grid', {
        location,
        radius,
        searchTerm: '', // Optional search term
        jobId // Reference back to our job tracking
      });

      res.json({ 
        jobId: job.id, 
        message: `Scraper job started for ${location}`,
        status: 'running'
      });
    } catch (error) {
      logger.error('Error starting scraper job:', error);
      res.status(500).json({ error: 'Failed to start scraper job' });
    }
  });

  // New endpoint for running a website audit from the admin panel
  router.post('/scraper/audit', async (req, res) => {
    try {
      const { businessId, url } = req.body;

      if (!businessId || !url) {
        return res.status(400).json({ error: 'Business ID and URL are required' });
      }

      // Verify URL format
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const job = await auditQueue.add('audit-website', {
        businessId,
        url,
      });

      res.json({ 
        jobId: job.id, 
        message: `Website audit started for ${url}`,
        status: 'running'
      });
    } catch (error) {
      logger.error('Error starting website audit:', error);
      res.status(500).json({ error: 'Failed to start website audit' });
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
