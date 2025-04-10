import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { setupQueues, scraperQueue, auditQueue } from './queues/index.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';
import { getRedisClient } from './config/redis.js';
import { Job, Queue } from 'bull';
import { Redis } from 'ioredis';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Queue instances
let scraperQueueInstance: Queue;
let auditQueueInstance: Queue;
let dataProcessingQueueInstance: Queue;

// Log environment info
logger.info(`Starting scraper service in ${process.env.NODE_ENV || 'development'} mode`);
logger.info(`Node.js version: ${process.version}`);
logger.info(`Memory limits: ${JSON.stringify(process.memoryUsage())}`);

// Middleware
app.use(express.json());

// CORS configuration for API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis connection
    const redis = await getRedisClient();
    logger.info('Redis connection initialized');

    // Initialize queues
    await setupQueues();
    scraperQueueInstance = scraperQueue();
    auditQueueInstance = auditQueue();
    logger.info('Job queues initialized');

    // Set up data processing queue
    dataProcessingQueueInstance = await setupDataProcessingQueue();
    logger.info('Data processing queue initialized');

    // Initialize Supabase client
    getSupabaseClient();
    logger.info('Supabase client initialized');

    // Set up routes with initialized queues
    const router = setupRoutes(scraperQueueInstance, auditQueueInstance, dataProcessingQueueInstance);
    app.use('/api', router);
    logger.info('Routes initialized');

  } catch (error: any) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Add type definitions for health check response
interface RedisStatus {
  configured_url: string;
  status: string;
  error?: string;
}

interface QueueStatus {
  scraper: any | null;
  audit: any | null;
  error?: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  redis: RedisStatus;
  queues: QueueStatus;
  system: {
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  error?: string;
}

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    redis: {
      configured_url: (process.env.REDIS_URL || 'redis://redis.railway.internal:6379').replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
      status: 'unknown'
    },
    queues: {
      scraper: null,
      audit: null
    },
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  try {
    // Try to get Redis status without waiting for initialization
    const redis = new Redis(process.env.REDIS_URL || 'redis://redis.railway.internal:6379', {
      lazyConnect: true,
      connectTimeout: 2000, // Short timeout for health check
      maxRetriesPerRequest: 1
    });

    try {
      await redis.ping();
      healthStatus.redis.status = 'connected';
    } catch (redisError: any) {
      healthStatus.redis.status = 'error';
      healthStatus.redis.error = redisError.message;
    } finally {
      // Always disconnect the temporary Redis client
      redis.disconnect();
    }

    // Try to get queue status if available
    if (scraperQueueInstance && auditQueueInstance) {
      try {
        const [scraperCounts, auditCounts] = await Promise.all([
          scraperQueueInstance.getJobCounts().catch(() => null),
          auditQueueInstance.getJobCounts().catch(() => null)
        ]);
        healthStatus.queues.scraper = scraperCounts;
        healthStatus.queues.audit = auditCounts;
      } catch (queueError) {
        healthStatus.queues.error = 'Failed to get queue status';
      }
    }

    // Always return 200 if we can generate a response
    res.status(200).json(healthStatus);
  } catch (error: any) {
    logger.error('Health check error:', error);
    // Still return 200 as long as we can respond
    res.status(200).json({
      ...healthStatus,
      error: error.message
    });
  }
});

// Enhanced Redis test endpoint
app.get('/test-redis-connection', async (req, res) => {
  try {
    const redis = await getRedisClient();
    
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const endTime = Date.now();

    const results = {
      connection_test: {
        success: pingResult === 'PONG',
        ping_time_ms: endTime - startTime,
        error: null
      },
      redis_status: {
        connected: true,
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      queue_status: {
        scraper: await scraperQueueInstance.getJobCounts(),
        audit: await auditQueueInstance.getJobCounts()
      }
    };

    res.status(200).json(results);
  } catch (error: any) {
    logger.error('Redis test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
initializeServices().then(() => {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode - performance optimized');
    } else {
      logger.info('Running in development mode - for testing and debugging');
    }
  });
}).catch((error: any) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
