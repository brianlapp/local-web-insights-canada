import express from 'express';
import { Queue } from 'bull';
import { logger } from '../utils/logger';

const router = express.Router();

interface GridSearchRequest {
  gridId: string;
  gridName: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  category: string;
  scraperRunId: string;
}

interface WebsiteAuditRequest {
  businessId: string;
  url: string;
}

export function setupRoutes(
  scraperQueue: Queue,
  auditQueue: Queue
) {
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Queue status endpoint
  router.get('/status', async (req, res) => {
    try {
      const [
        scraperJobCounts,
        auditJobCounts
      ] = await Promise.all([
        scraperQueue.getJobCounts(),
        auditQueue.getJobCounts()
      ]);

      res.json({
        scraper: scraperJobCounts,
        audit: auditJobCounts
      });
    } catch (error) {
      logger.error('Error getting queue status:', error);
      res.status(500).json({ error: 'Failed to get queue status' });
    }
  });

  // Trigger grid search
  router.post('/search', async (req, res) => {
    try {
      const data = req.body as GridSearchRequest;
      
      // Validate request
      if (!data.gridId || !data.gridName || !data.bounds || !data.category || !data.scraperRunId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const job = await scraperQueue.add('search-grid', {
        grid: {
          id: data.gridId,
          name: data.gridName,
          bounds: data.bounds
        },
        category: data.category,
        scraperRunId: data.scraperRunId
      });

      res.json({
        jobId: job.id,
        status: 'queued'
      });

    } catch (error) {
      logger.error('Error queueing grid search:', error);
      res.status(500).json({ error: 'Failed to queue grid search' });
    }
  });

  // Trigger website audit
  router.post('/audit', async (req, res) => {
    try {
      const data = req.body as WebsiteAuditRequest;
      
      // Validate request
      if (!data.businessId || !data.url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Basic URL validation
      try {
        new URL(data.url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const job = await auditQueue.add('audit-website', {
        businessId: data.businessId,
        url: data.url
      });

      res.json({
        jobId: job.id,
        status: 'queued'
      });

    } catch (error) {
      logger.error('Error queueing website audit:', error);
      res.status(500).json({ error: 'Failed to queue website audit' });
    }
  });

  // Get job status
  router.get('/jobs/:id', async (req, res) => {
    try {
      const jobId = req.params.id;
      
      // Try to find job in either queue
      const job = await scraperQueue.getJob(jobId) || await auditQueue.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const state = await job.getState();
      const progress = job.progress();
      
      res.json({
        id: job.id,
        state,
        progress,
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason
      });

    } catch (error) {
      logger.error('Error getting job status:', error);
      res.status(500).json({ error: 'Failed to get job status' });
    }
  });

  return router;
} 