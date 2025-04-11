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

declare global {
  var redisClient: Redis | null;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

let scraperQueueInstance: Queue;
let auditQueueInstance: Queue;
let dataProcessingQueueInstance: Queue;

logger.info(`Starting scraper service in ${process.env.NODE_ENV || 'development'} mode`);
logger.info(`Node.js version: ${process.version}`);
logger.info(`Memory limits: ${JSON.stringify(process.memoryUsage())}`);

logger.info('=== STARTUP DIAGNOSTICS ===');
logger.info(`Process ID: ${process.pid}`);
logger.info(`Working Directory: ${process.cwd()}`);
logger.info(`Node Version: ${process.version}`);
logger.info(`Platform: ${process.platform}`);
logger.info(`Architecture: ${process.arch}`);
logger.info(`Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
logger.info(`Environment Variables: PORT=${process.env.PORT}`);
logger.info('=== END DIAGNOSTICS ===');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.get('/api/health', async (_req, res) => {
  try {
    const status = await getHealthStatus();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(200).json({
      status: 'ok',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function initializeServices() {
  let redis = null;
  let queuesInitialized = false;

  try {
    redis = await getRedisClient();
    logger.info('Redis connection for general use initialized');

    await setupQueues();
    scraperQueueInstance = scraperQueue();
    auditQueueInstance = auditQueue();
    dataProcessingQueueInstance = await setupDataProcessingQueue();
    queuesInitialized = true;
    logger.info('Job queues initialized with dedicated Redis clients');
  } catch (error: any) {
    logger.error('Failed to initialize Redis and queues:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
    getSupabaseClient();
    logger.info('Supabase client initialized');
  } catch (error: any) {
    logger.error('Failed to initialize Supabase:', error);
    // Don't exit - continue with degraded functionality
  }

  try {
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

  return {
    redis: redis !== null,
    queues: queuesInitialized,
    supabase: true
  };
}

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

  if (global.redisClient) {
    try {
      await global.redisClient.ping();
      healthStatus.redis.status = 'connected';
    } catch (redisError: any) {
      healthStatus.redis.status = 'error';
      healthStatus.redis.error = redisError.message;
    }
  }

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

logger.info('Starting server...');
const server = app.listen(Number(port), '0.0.0.0', () => {
  logger.info('=== SERVER STARTED ===');
  logger.info(`Server listening on port ${port}`);
  logger.info(`Server address: ${JSON.stringify(server.address())}`);
  logger.info('=== END SERVER INFO ===');
  
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
