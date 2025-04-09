import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { processGridSearch } from './queues/processors/gridSearch.js';
import { processWebsiteAudit } from './queues/processors/websiteAudit.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';
import { scraperQueue, auditQueue, setupQueues } from './queues/index.js';
import Redis from 'ioredis';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Get Redis URL from environment variable or use default
const REDIS_URL = process.env.REDIS_URL || "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:13781";
logger.info(`Main app using Redis URL: ${REDIS_URL.replace(/\/\/.*@/, '//***@')}`);

// Initialize and set up queues from the centralized queue module
setupQueues().catch(error => {
  logger.error(`Failed to set up queues: ${error.message}`, { error });
});

// Set up data processing queue
const dataProcessingQueue = setupDataProcessingQueue();

// Handle completed jobs (additional handlers beyond the basic ones in queues/index.js)
scraperQueue.on('completed', async (job) => {
  logger.info(`Processing completed scraper job ${job.id}`);
  
  // If this job is linked to a scraper_run record, update its status
  const jobData = job.data;
  if (jobData.jobId) {
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('scraper_runs')
        .update({ 
          status: 'completed',
          businessesFound: jobData.businesses?.length || 0
        })
        .eq('id', jobData.jobId);
    } catch (error) {
      logger.error(`Error updating job status for ${job.id}:`, error);
    }
  }
});

// Handle failed jobs (additional handlers beyond the basic ones in queues/index.js)
scraperQueue.on('failed', async (job, error) => {
  logger.error(`Processing failed scraper job ${job.id}:`, error);
  
  // If this job is linked to a scraper_run record, update its status
  const jobData = job.data;
  if (jobData.jobId) {
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('scraper_runs')
        .update({ 
          status: 'failed',
          error: error.message
        })
        .eq('id', jobData.jobId);
    } catch (updateError) {
      logger.error(`Error updating job status for ${job.id}:`, updateError);
    }
  }
});

// Set up routes
app.use('/api', setupRoutes(scraperQueue, auditQueue, dataProcessingQueue));

// Add a root health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Scraper service is running' });
});

// Add detailed status endpoint for troubleshooting
app.get('/status', (req, res) => {
  const statusInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    redisConnected: !!process.env.REDIS_URL,
    redisUrl: REDIS_URL.replace(/\/\/.*@/, '//***@'),
    version: process.version,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    headers: req.headers,
  };
  
  res.status(200).json(statusInfo);
});

// Enhanced Redis connection test endpoint
app.get('/test-redis-connection', async (req, res) => {
  const testRedisUrl = REDIS_URL;
  
  const results = {
    connection_test: {
      success: false,
      error: null as any,
      ping_time_ms: 0
    },
    redis_info: null,
    queue_configs: {
      scraper_queue: scraperQueue.opts,
      audit_queue: auditQueue.opts,
      data_processing_queue: dataProcessingQueue.opts
    }
  };
  
  // Try to connect to Redis
  try {
    logger.info(`Testing Redis connection to: ${testRedisUrl.replace(/\/\/.*@/, '//***@')}`);
    
    const redis = new Redis(testRedisUrl, {
      connectTimeout: 10000, // 10 seconds
      maxRetriesPerRequest: 3
    });
    
    // Test Redis connection with a simple ping
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const endTime = Date.now();
    
    results.connection_test.success = pingResult === 'PONG';
    results.connection_test.ping_time_ms = endTime - startTime;
    
    // If connection works, get basic Redis info
    if (results.connection_test.success) {
      const info = await redis.info();
      results.redis_info = info.split('\n').slice(0, 10).join('\n');
      logger.info(`Successfully connected to Redis: ping time ${results.connection_test.ping_time_ms}ms`);
    }
    
    redis.disconnect();
  } catch (error: any) {
    logger.error(`Redis connection test failed: ${error.message}`, { error });
    results.connection_test.error = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall
    };
  }
  
  res.status(200).json(results);
});

// Also update the railway.toml file with the correct port
app.get('/update-railway-config', (req, res) => {
  const railwayConfig = {
    current_redis_url: REDIS_URL.replace(/\/\/.*@/, '//***@'),
    suggested_update: "Update the REDIS_URL in railway.toml to use port 13781 instead of 6379"
  };
  
  res.status(200).json(railwayConfig);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // In production, log less verbose info
  if (process.env.NODE_ENV === 'production') {
    logger.info('Running in production mode - performance optimized');
  } else {
    logger.info('Running in development mode - for testing and debugging');
    logger.info(`Test routes ${process.env.ENABLE_TEST_ROUTES === 'true' ? 'enabled' : 'disabled'}`);
  }
});
