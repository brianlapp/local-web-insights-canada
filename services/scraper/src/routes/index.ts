import express from 'express';
import { Request, Response } from 'express';
import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { getSupabaseClient } from '../utils/database.js';
import os from 'os';
import { getRedisClient } from '../config/redis.js';

// Define request types
interface StartRequest extends Request {
  body: {
    location?: string;
    jobId?: string;
  };
}

interface AuditRequest extends Request {
  body: {
    businessId: string;
    url: string;
  };
}

// Define job data types
interface ScraperJobData {
  location: string;
  jobId?: string;
}

interface AuditJobData {
  businessId: string;
  url: string;
}

export const setupRoutes = (
  scraperQueue: Queue.Queue<ScraperJobData> | null,
  auditQueue: Queue.Queue<AuditJobData> | null,
  dataProcessingQueue: Queue.Queue | null
) => {
  const router = express.Router();

  router.get('/health', (_req: Request, res: Express.Response) => {
    res.json({ status: 'ok' });
  });

  router.get('/api/health', async (_req: Request, res: Express.Response) => {
    try {
      const startTime = process.hrtime();
      
      // Check system resources
      const memoryUsage = process.memoryUsage();
      const cpuInfo = os.cpus();
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();
      
      // Check Redis connection
      const redisStatus = { connected: false, error: null as string | null };
      try {
        const redis = await getRedisClient();
        await redis.ping();  // Actually test the connection
        redisStatus.connected = true;
      } catch (error: unknown) {
        redisStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      // Test database connection
      const supabase = getSupabaseClient();
      const { error: dbError } = await supabase.from('health_checks')
        .select('count(*)', { count: 'exact', head: true });
      
      // Calculate response time
      const endTime = process.hrtime(startTime);
      const responseTimeMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      
      const healthData = {
        status: 'ok',
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
          systemTotal: `${Math.round(totalMemory / 1024 / 1024)} MB`,
          systemFree: `${Math.round(freeMemory / 1024 / 1024)} MB`,
          systemUsagePercent: `${(100 - (freeMemory / totalMemory) * 100).toFixed(1)}%`
        },
        cpu: {
          cores: cpuInfo.length,
          model: cpuInfo[0]?.model || 'unknown',
          speed: `${cpuInfo[0]?.speed || 0} MHz`
        },
        redis: redisStatus,
        database: {
          connected: !dbError,
          error: dbError ? dbError.message : null
        },
        responseTime: `${responseTimeMs} ms`
      };
      
      // Log metrics for monitoring
      logger.info('Health check metrics', { metrics: healthData });
      
      // Always return 200 OK to prevent service disruption
      res.json(healthData);
    } catch (error: unknown) {
      logger.error('Health check failed', error);
      // Still return 200 OK with error details
      res.json({
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  router.get('/start', async (_req: Request, res: Express.Response) => {
    if (!scraperQueue) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Scraper queue not available' 
      });
    }

    try {
      // Simplified response for GET requests
      res.status(200).json({ status: 'ok', message: 'Use POST to start scraping' });
    } catch (error) {
      logger.error('Error with start endpoint:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  });

  router.post('/start', async (req: StartRequest, res: Express.Response) => {
    if (!scraperQueue) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Scraper queue not available' 
      });
    }

    try {
      const { location, jobId } = req.body;
      
      // Add job to queue with proper typing
      const jobData: ScraperJobData = {
        location: location || 'Ottawa',
        jobId
      };
      await scraperQueue.add('search-grid', jobData);
      
      res.status(200).json({ status: 'ok', message: 'Scraping job added to queue', jobId });
    } catch (error) {
      logger.error('Error starting scraper job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add scraper job to queue' });
    }
  });

  router.post('/audit', async (req: AuditRequest, res: Express.Response) => {
    if (!auditQueue) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Audit queue not available' 
      });
    }

    try {
      const { businessId, url } = req.body;
      
      if (!businessId || !url) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Business ID and URL are required' 
        });
      }
      
      // Add audit job to queue with proper typing
      const jobData: AuditJobData = {
        businessId,
        url
      };
      await auditQueue.add('audit-website', jobData);
      
      res.status(200).json({ 
        status: 'ok', 
        message: 'Website audit job added to queue',
        businessId,
        url 
      });
    } catch (error) {
      logger.error('Error starting website audit job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add audit job to queue' });
    }
  });

  return router;
};

export default setupRoutes;
