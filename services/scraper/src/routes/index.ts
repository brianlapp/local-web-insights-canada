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
  error?: string;
  status_code?: string;
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
  
  // Super simple test endpoint that can't fail
  router.get('/test-minimal', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });
  
  // Test the Google Places API key
  router.get('/test-places-api', async (req: Request, res: Response) => {
    try {
      // Get your Google API key from environment - support both environment variable names
      const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEYS;
      
      console.log('Testing Places API, key exists:', !!apiKey);
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Google Places/Maps API key not configured',
          keyExists: false,
          availableEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
        });
      }
      
      // Make a simple test call to the Places API
      const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=name,rating&key=${apiKey}`;
      
      console.log('Making test request to Places API');
      
      // Use node-fetch or your preferred HTTP client
      const response = await fetch(testUrl);
      const data = await response.json();
      
      // Check if the response indicates an error with the API key
      const hasApiError = data.status === 'REQUEST_DENIED' || 
                          data.error_message?.includes('API key');
      
      if (hasApiError) {
        console.error('Places API key error:', data);
        return res.json({
          status: 'error',
          keyExists: true,
          keyValid: false,
          message: data.error_message || 'API key error'
        });
      }
      
      // Success response
      return res.json({
        status: 'success',
        keyExists: true,
        keyValid: true,
        apiStatus: data.status
      });
    } catch (error) {
      console.error('Places API test failed:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        keyExists: !!process.env.GOOGLE_PLACES_API_KEY
      });
    }
  });
  
  // Add a simple test endpoint that doesn't use the queue
  router.post('/test-start', (req: Request, res: Response) => {
    console.log('TEST-START ENDPOINT CALLED');
    console.log('TEST-START BODY:', JSON.stringify(req.body, null, 2));
    
    // Just return success without doing anything
    res.status(200).json({
      status: 'ok',
      message: 'Test endpoint called successfully',
      receivedData: req.body
    });
  });

  router.get('/health-detailed', async (_req: Request, res: Response<HealthCheckResponse>) => {
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
    // Log the request with detailed information
    console.log('Scraper start request received:', {
      body: req.body,
      apiKeyExists: !!process.env.GOOGLE_PLACES_API_KEY,
      timestamp: new Date().toISOString()
    });
    
    try {
      if (!scraperQueue) {
        logger.error('Scraper queue not available');
        res.status(503).json({ 
          status: 'error', 
          message: 'Scraper queue not available' 
        });
        return;
      }

      // Get location and jobId from request
      const { location, jobId } = req.body;
      
      // Validate required parameters
      if (!location) {
        logger.warn('Missing location parameter in request');
        res.status(400).json({
          status: 'error',
          message: 'Location is required',
          status_code: 'validation_error'
        });
        return;
      }
      
      // Check if Google API key exists - support both environment variable names
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEYS;
      if (!googleApiKey) {
        console.error('Missing Google Maps/Places API key');
        return res.status(500).json({ 
          status: 'error', 
          message: 'Configuration error: Missing API key'
        });
      }
      
      // Create a very simple job with minimal data
      const jobData = {
        location: location,
        radius: 50, 
        searchTerm: req.body.searchTerm || '',
        jobId: jobId
      };
      
      console.log('Starting scraper with:', jobData);
      
      // If you're using a queue, add simple validation of the queue
      if (typeof scraperQueue?.add !== 'function') {
        console.error('Scraper queue not properly initialized');
        return res.status(500).json({
          status: 'error',
          message: 'Scraper service not ready'
        });
      }
      
      // Add job to queue with a try/catch specifically for this operation
      try {
        const job = await scraperQueue.add(jobData, {
          attempts: 3,
          timeout: 120000 // 2 minutes timeout
        });
        
        console.log('Job added to queue:', job.id);
        
        res.status(200).json({ 
          status: 'success',
          message: 'Scraper job started',
          jobId: job.id.toString()
        });
      } catch (queueError) {
        // Specifically log queue errors with detail
        console.error('Error adding job to queue:', {
          error: queueError,
          message: queueError instanceof Error ? queueError.message : 'Unknown error',
          stack: queueError instanceof Error ? queueError.stack : 'No stack available'
        });
        
        res.status(500).json({ 
          status: 'error', 
          message: queueError instanceof Error ? queueError.message : 'Error adding job to queue'
        });
      }
    } catch (error) {
      // Log any other errors with more detail
      console.error('Scraper start failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack available'
      });
      
      res.status(500).json({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to start scraper'
      });
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
