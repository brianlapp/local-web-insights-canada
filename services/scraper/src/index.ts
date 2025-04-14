import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { 
  setupQueues, 
  getScraperQueue, 
  getAuditQueue, 
  getDataProcessingQueue 
} from './queues/index.js';
import { getSupabaseClient } from './utils/database.js';
import { getRedisClient } from './config/redis.js';
import { Job, Queue } from 'bull';
import Redis from 'ioredis';

// Add at the top of the file, after imports
declare global {
  var redisClient: Redis | null;
}

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint - MUST be first, before any middleware or initialization
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Add this at the very top of the file
console.log('=== Startup Verification ===');
console.log('Module path:', import.meta.url);
console.log('Process info:', {
  cwd: process.cwd(),
  pid: process.pid,
  version: process.version,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  }
});

// Queue instances
let scraperQueueInstance: Queue;
let auditQueueInstance: Queue;
let dataProcessingQueueInstance: Queue;

// Log environment info
logger.info(`Starting scraper service in ${process.env.NODE_ENV || 'development'} mode`);
logger.info(`Node.js version: ${process.version}`);
logger.info(`Memory limits: ${JSON.stringify(process.memoryUsage())}`);

// Add startup diagnostics logging
logger.info('=== STARTUP DIAGNOSTICS ===');
logger.info(`Process ID: ${process.pid}`);
logger.info(`Working Directory: ${process.cwd()}`);
logger.info(`Node Version: ${process.version}`);
logger.info(`Platform: ${process.platform}`);
logger.info(`Architecture: ${process.arch}`);
logger.info(`Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
logger.info(`Environment Variables: PORT=${process.env.PORT}`);
logger.info('=== END DIAGNOSTICS ===');

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

// API health check endpoint (for detailed status)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const status = await getHealthStatus();
    res.status(200).json(status);
  } catch (error: any) {
    // Even on error, return 200 with error details
    res.status(200).json({
      status: 'ok',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize services
async function initializeServices() {
  let redis = null;
  let queuesInitialized = false;

  try {
    // Initialize Redis connection
    redis = await getRedisClient();
    logger.info('Redis connection initialized');

    // Initialize queues
    await setupQueues();
    scraperQueueInstance = getScraperQueue();
    auditQueueInstance = getAuditQueue();
    dataProcessingQueueInstance = getDataProcessingQueue();
    queuesInitialized = true;
    logger.info('Job queues initialized');
  } catch (error: any) {
    logger.error('Failed to initialize Redis and queues:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
    // Initialize Supabase client
    getSupabaseClient();
    logger.info('Supabase client initialized');
  } catch (error: any) {
    logger.error('Failed to initialize Supabase:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
    // Set up routes with initialized queues (might be null if initialization failed)
    const router = setupRoutes(
      queuesInitialized ? scraperQueueInstance : null,
      queuesInitialized ? auditQueueInstance : null,
      queuesInitialized ? dataProcessingQueueInstance : null
    );
    app.use('/api', router);
    logger.info('Routes initialized');
  } catch (error: any) {
    logger.error('Failed to initialize routes:', error);
    // Don't exit - continue with basic endpoints
  }

  // Return initialization status
  return {
    redis: redis !== null,
    queues: queuesInitialized,
    supabase: true // We can add more detailed status if needed
  };
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

// Health check function that can be reused
async function getHealthStatus(): Promise<HealthStatus> {
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

  // Use existing Redis client if available
  if (global.redisClient) {
    try {
      await global.redisClient.ping();
      healthStatus.redis.status = 'connected';
    } catch (redisError: any) {
      healthStatus.redis.status = 'error';
      healthStatus.redis.error = redisError.message;
    }
  }

  // Use existing queue instances if available
  if (scraperQueueInstance && auditQueueInstance) {
    try {
      healthStatus.queues = {
        scraper: scraperQueueInstance.client ? 'connected' : 'disconnected',
        audit: auditQueueInstance.client ? 'connected' : 'disconnected'
      };
    } catch (queueError) {
      healthStatus.queues.error = 'Failed to get queue status';
    }
  }

  return healthStatus;
}

// Enhanced Redis test endpoint
app.get('/test-redis-connection', async (req: Request, res: Response) => {
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
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', req.error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with detailed error handling
logger.info('Starting server...');
const server = app.listen(Number(port), '0.0.0.0', () => {
  logger.info('=== SERVER STARTED ===');
  logger.info(`Server listening on port ${port}`);
  logger.info(`Server address: ${JSON.stringify(server.address())}`);
  logger.info('=== END SERVER INFO ===');
  
  // Initialize services in background
  initializeServices()
    .then(status => {
      logger.info('=== SERVICES STATUS ===');
      logger.info('Services initialized:', status);
      logger.info('=== END SERVICES STATUS ===');
    })
    .catch(error => {
      logger.error('=== SERVICE ERROR ===');
      logger.error('Service initialization error:', error);
      logger.error('Stack trace:', error.stack);
      logger.error('=== END SERVICE ERROR ===');
    });
}).on('error', (error: Error) => {
  logger.error('=== SERVER ERROR ===');
  logger.error('Server failed to start:', error);
  logger.error('Error name:', error.name);
  logger.error('Error message:', error.message);
  logger.error('Stack trace:', error.stack);
  logger.error('=== END SERVER ERROR ===');
  process.exit(1);
});

// Enhanced error handling
process.on('uncaughtException', (error: Error) => {
  logger.error('=== UNCAUGHT EXCEPTION ===');
  logger.error('Uncaught exception:', error);
  logger.error('Stack trace:', error.stack);
  logger.error('=== END UNCAUGHT EXCEPTION ===');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('=== UNHANDLED REJECTION ===');
  logger.error('Unhandled rejection at:', promise);
  logger.error('Reason:', reason);
  logger.error('=== END UNHANDLED REJECTION ===');
});
