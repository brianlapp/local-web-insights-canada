import express from 'express';
import { Queue } from 'bull';
import { logger } from '../utils/logger';
import { placesClient } from '../utils/placesClient';
import { calculateOptimalGridSystem, Bounds, generateSubGridFromPoint } from '../utils/gridCalculator';

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
  options?: {
    validateOnly?: boolean;
    detectTechnologies?: boolean;
    fullAudit?: boolean;
  };
}

interface GridGenerationRequest {
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

interface PointSearchRequest {
  lat: number;
  lng: number;
  radius?: number;
  category: string;
  scraperRunId?: string;
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

  // API key status endpoint
  router.get('/api-keys', (req, res) => {
    try {
      const keyStats = placesClient.getApiKeyStats();
      res.json({
        keys: keyStats.map(key => ({
          keyIndex: key.keyIndex,
          isCurrent: key.isCurrent,
          dailyQuota: key.dailyQuota,
          requestsPerDay: key.requestsPerDay,
          remainingRequests: key.remainingRequests,
          lastRotation: key.lastRotation
        }))
      });
    } catch (error) {
      logger.error('Error getting API key status:', error);
      res.status(500).json({ error: 'Failed to get API key status' });
    }
  });

  // Generate grid system
  router.post('/generate-grid', (req, res) => {
    try {
      const data = req.body as GridGenerationRequest;
      
      // Validate request
      if (!data.bounds || !data.bounds.northeast || !data.bounds.southwest) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate grid system
      const subGrids = calculateOptimalGridSystem(data.bounds);
      
      res.json({
        gridCount: subGrids.length,
        grids: subGrids
      });

    } catch (error) {
      logger.error('Error generating grid system:', error);
      res.status(500).json({ error: 'Failed to generate grid system' });
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

  // Trigger point search
  router.post('/search-point', async (req, res) => {
    try {
      const data = req.body as PointSearchRequest;
      
      // Validate request
      if (data.lat === undefined || data.lng === undefined || !data.category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Use default radius if not provided
      const radius = data.radius || 1000;

      const job = await scraperQueue.add('search-grid', {
        gridId: `point-${Date.now()}`,
        lat: data.lat,
        lng: data.lng,
        radius,
        type: data.category,
        scraperRunId: data.scraperRunId
      });

      res.json({
        jobId: job.id,
        status: 'queued'
      });

    } catch (error) {
      logger.error('Error queueing point search:', error);
      res.status(500).json({ error: 'Failed to queue point search' });
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

      // Default options
      const options = data.options || {
        validateOnly: false,
        detectTechnologies: true,
        fullAudit: true
      };

      // Handle validate-only option
      if (options.validateOnly) {
        // Import and use validator directly
        const { validateUrl } = require('../utils/urlValidator');
        const validation = await validateUrl(data.url);
        
        return res.json({
          businessId: data.businessId,
          url: data.url,
          urlValidation: validation,
          status: 'completed',
          type: 'validation-only'
        });
      }

      // Create the job with appropriate options
      const job = await auditQueue.add('audit-website', {
        businessId: data.businessId,
        url: data.url,
        options
      });

      res.json({
        jobId: job.id,
        status: 'queued',
        message: 'Website audit job has been queued',
        options
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