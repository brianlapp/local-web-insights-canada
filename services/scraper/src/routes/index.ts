import express, { Request, Response } from 'express';
import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { getSupabaseClient } from '../utils/database.js';
import os from 'os';
import { getRedisClient } from '../config/redis.js';

export const setupRoutes = (
  scraperQueue: Queue.Queue | null,
  auditQueue: Queue.Queue | null,
  dataProcessingQueue: Queue.Queue | null
) => {
  const router = express.Router();

  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  router.get('/api/health', async (req, res) => {
    try {
      const startTime = process.hrtime();
      
      // Check system resources
      const memoryUsage = process.memoryUsage();
      const cpuInfo = os.cpus();
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();
      
      // Check Redis connection
      let redisStatus = { connected: false, error: null };
      try {
        const redis = await getRedisClient();
        await redis.ping();  // Actually test the connection
        redisStatus.connected = true;
      } catch (error: any) {
        redisStatus.error = error.message;
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
        responseTime: `${responseTimeMs} ms`,
        queueStatus: {
          scraperQueue: scraperQueue ? "available" : "unavailable",
          auditQueue: auditQueue ? "available" : "unavailable",
          dataProcessingQueue: dataProcessingQueue ? "available" : "unavailable"
        }
      };
      
      // Log metrics for monitoring
      logger.info('Health check metrics', { metrics: healthData });
      
      // Always return 200 OK to prevent service disruption
      res.json(healthData);
    } catch (error: any) {
      logger.error('Health check failed', error);
      // Still return 200 OK with error details
      res.json({
        status: 'degraded',
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  router.get('/start', async (req, res) => {
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

  router.post('/start', async (req, res) => {
    if (!scraperQueue) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Scraper queue not available' 
      });
    }

    try {
      const { location, jobId } = req.body;
      
      // Add job to queue
      await scraperQueue.add('search-grid', {
        location: location || 'Ottawa',
        jobId
      });
      
      res.status(200).json({ status: 'ok', message: 'Scraping job added to queue', jobId });
    } catch (error) {
      logger.error('Error starting scraper job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add scraper job to queue' });
    }
  });

  router.get('/scraper/start', async (req, res) => {
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

  router.post('/scraper/start', async (req, res) => {
    if (!scraperQueue) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Scraper queue not available' 
      });
    }

    try {
      const { location, jobId } = req.body;
      
      // Add job to queue
      await scraperQueue.add('search-grid', {
        location: location || 'Ottawa',
        jobId
      });
      
      res.status(200).json({ status: 'ok', message: 'Scraping job added to queue', jobId });
    } catch (error) {
      logger.error('Error starting scraper job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add scraper job to queue' });
    }
  });

  router.post('/audit', async (req, res) => {
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
      
      // Add audit job to queue
      await auditQueue.add('audit-website', {
        businessId,
        url
      });
      
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

  router.post('/scraper/audit', async (req, res) => {
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
      
      // Add audit job to queue
      await auditQueue.add('audit-website', {
        businessId,
        url
      });
      
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

  router.get('/scraper/debug/queues', async (req, res) => {
    try {
      const result = {
        queues: {
          scraper: scraperQueue ? {
            isReady: Boolean(scraperQueue.client),
            counts: scraperQueue ? await scraperQueue.getJobCounts() : null
          } : null,
          audit: auditQueue ? {
            isReady: Boolean(auditQueue.client),
            counts: auditQueue ? await auditQueue.getJobCounts() : null
          } : null,
          dataProcessing: dataProcessingQueue ? {
            isReady: Boolean(dataProcessingQueue.client),
            counts: dataProcessingQueue ? await dataProcessingQueue.getJobCounts() : null
          } : null
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(result);
    } catch (error: any) {
      logger.error('Queue debug error:', error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  router.post('/scraper/reset-status', async (req, res) => {
    try {
      const { jobId } = req.body;
      
      const supabase = getSupabaseClient();
      let query = supabase.from('scraper_runs').update({ 
        status: 'cancelled',
        error: 'Job was manually reset by user'
      });
      
      if (jobId) {
        query = query.eq('id', jobId);
      } else {
        query = query.eq('status', 'running');
      }
      
      const { error } = await query;
      
      if (error) {
        logger.error('Error resetting job status:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Failed to reset job status',
          error: error.message
        });
      }
      
      res.status(200).json({ 
        status: 'ok', 
        message: jobId ? `Reset status for job ${jobId}` : 'Reset status for all running jobs'
      });
    } catch (error: any) {
      logger.error('Error in reset-status endpoint:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to reset job status',
        error: error.message
      });
    }
  });

  return router;
};

export default setupRoutes;
