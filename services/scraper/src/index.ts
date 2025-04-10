import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { setupQueues, scraperQueue, auditQueue } from './queues/index.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';
import { RedisManager } from './config/redis.js';

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

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis connection
    await RedisManager.getInstance().getClient();
    logger.info('Redis connection initialized');

    // Initialize queues
    await setupQueues();
    logger.info('Job queues initialized');

    // Set up data processing queue
    const dataProcessingQueue = setupDataProcessingQueue();

    // Initialize Supabase client
    getSupabaseClient();
    logger.info('Supabase client initialized');

    // Set up routes
    const router = setupRoutes(scraperQueue(), auditQueue(), dataProcessingQueue);
    app.use('/api', router);
    logger.info('Routes initialized');

    // Handle completed jobs
    scraperQueue().on('completed', async (job) => {
      logger.info(`Processing completed scraper job ${job.id}`);
      
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

    // Handle failed jobs
    scraperQueue().on('failed', async (job, error) => {
      logger.error(`Processing failed scraper job ${job.id}:`, error);
      
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

  } catch (error: any) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const redisStatus = RedisManager.getInstance().getConnectionStatus();
    const scraper = scraperQueue();
    const audit = auditQueue();

    const queueCounts = await Promise.all([
      scraper.getJobCounts(),
      audit.getJobCounts()
    ]);

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      redis: redisStatus,
      queues: {
        scraper: queueCounts[0],
        audit: queueCounts[1]
      },
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    res.status(200).json(healthStatus);
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Enhanced Redis test endpoint
app.get('/test-redis-connection', async (req, res) => {
  try {
    const redisManager = RedisManager.getInstance();
    const redis = await redisManager.getClient();
    
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const endTime = Date.now();

    const results = {
      connection_test: {
        success: pingResult === 'PONG',
        ping_time_ms: endTime - startTime,
        error: null
      },
      redis_status: redisManager.getConnectionStatus(),
      queue_status: {
        scraper: await scraperQueue().getJobCounts(),
        audit: await auditQueue().getJobCounts()
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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
