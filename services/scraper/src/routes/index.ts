import express, { Request, Response } from 'express';
import type { Queue } from 'bull';
import { logger } from '../utils/logger.js';
import { getSupabaseClient } from '../utils/database.js';
import os from 'os';
import { getRedisClient } from '../config/redis.js';

// Define request types
interface HealthResponse {
  status: string;
  message: string;
}

interface ScraperResponse {
  status: string;
  message: string;
  jobId?: string;
}

interface AuditResponse {
  status: string;
  message: string;
  businessId?: string;
  url?: string;
}

interface StartRequestBody {
  businessId: string;
  url: string;
  searchTerm?: string;
}

interface AuditRequestBody {
  businessId: string;
  url: string;
}

// Define job data types
interface ScraperJobData {
  location: string;
  jobId?: string;
  radius: number;
  searchTerm?: string;
}

interface AuditJobData {
  businessId: string;
  url: string;
  options?: {
    runLighthouse?: boolean;
    detectTechnologies?: boolean;
    takeScreenshots?: boolean;
    validateOnly?: boolean;
  };
}

// Define response types
interface HealthCheckResponse {
  status: string;
  message: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
    systemTotal: string;
    systemFree: string;
    systemUsagePercent: string;
  };
  cpu: {
    cores: number;
    model: string;
    speed: string;
  };
  redis: {
    connected: boolean;
    error: string | null;
  };
  database: {
    connected: boolean;
    error: string | null;
  };
  responseTime: string;
}

export const setupRoutes = (
  scraperQueue: Queue<ScraperJobData> | null,
  auditQueue: Queue<AuditJobData> | null,
  dataProcessingQueue: Queue | null
): express.Router => {
  const router = express.Router();

  const jobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  };

  router.get('/health', (_req: Request, res: Response<HealthResponse>) => {
    try {
      const response: HealthResponse = { status: 'ok', message: 'Service is healthy' };
      res.status(200).json(response);
    } catch (error) {
      logger.error('Health check failed:', error);
      const response: HealthResponse = { status: 'error', message: 'Service health check failed' };
      res.status(500).json(response);
    }
  });

  router.get('/api/health', async (_req: Request, res: Response<HealthCheckResponse>) => {
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
      
      const healthData: HealthCheckResponse = {
        status: 'ok',
        message: 'Service is healthy',
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV || 'development',
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
      res.status(200).json(healthData);
    } catch (error: unknown) {
      logger.error('Health check failed', error);
      // Still return 200 OK with error details
      res.json({
        status: 'degraded',
        message: error instanceof Error ? error.message : 'Health check failed with unknown error',
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: '0 MB',
          heapTotal: '0 MB',
          heapUsed: '0 MB',
          external: '0 MB',
          systemTotal: '0 MB',
          systemFree: '0 MB',
          systemUsagePercent: '0%'
        },
        cpu: {
          cores: 0,
          model: 'unknown',
          speed: '0 MHz'
        },
        redis: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        database: {
          connected: false,
          error: 'Failed to check database connection'
        },
        responseTime: '0 ms'
      });
    }
  });

  router.get('/start', async (_req: Request, res: Response<ScraperResponse>) => {
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

  router.post('/start', async (req: Request, res: Response<ScraperResponse>) => {
    if (!scraperQueue) {
      logger.error('Scraper queue not available');
      res.status(503).json({ 
        status: 'error', 
        message: 'Scraper queue not available' 
      });
      return;
    }

    try {
      // Log the request details for debugging
      logger.info('Received start request with body:', { 
        body: req.body,
        hasAuth: req.get('authorization') ? 'Present' : 'Missing',
        contentType: req.get('content-type')
      });
      
      // Get location and jobId from request
      const { location, jobId } = req.body;
      
      // Validate required parameters
      if (!location) {
        logger.warn('Missing location parameter in request');
        res.status(400).json({
          status: 'error',
          message: 'Location is required'
        });
        return;
      }
      
      // Prepare job data with proper parameters
      const jobData: ScraperJobData = {
        location: location,
        radius: 50, // Default radius in km
        searchTerm: req.body.searchTerm || '',
        jobId: jobId || undefined
      };
      
      logger.info(`Adding scraper job for location: ${location}`, { jobData });
      
      try {
        // Add job to queue
        const job = await scraperQueue.add(jobData, jobOptions);
        
        const response: ScraperResponse = { 
          status: 'ok', 
          message: 'Scraping job added to queue',
          jobId: job.id.toString()
        };
        
        logger.info('Scraper job added successfully', { jobId: job.id });
        res.status(200).json(response);
      } catch (queueError) {
        logger.error('Error adding job to queue:', queueError);
        throw queueError;
      }
    } catch (error) {
      logger.error('Failed to add scraping job:', error);
      const response: ScraperResponse = { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to add scraping job'
      };
      res.status(500).json(response);
    }
  });

  router.post('/audit', async (req: Request, res: Response<AuditResponse>) => {
    if (!auditQueue) {
      res.status(503).json({ 
        status: 'error', 
        message: 'Audit queue not available',
        businessId: req.body.businessId,
        url: req.body.url
      });
      return;
    }

    try {
      const jobData = {
        businessId: req.body.businessId,
        url: req.body.url
      };
      await auditQueue.add(jobData, jobOptions);
      const response: AuditResponse = { 
        status: 'ok', 
        message: 'Audit job added to queue',
        businessId: jobData.businessId,
        url: jobData.url
      };
      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to add audit job:', error);
      const response: AuditResponse = { 
        status: 'error', 
        message: 'Failed to add audit job',
        businessId: req.body.businessId,
        url: req.body.url
      };
      res.status(500).json(response);
    }
  });

  return router;
};

export default setupRoutes;
