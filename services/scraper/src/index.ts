import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { processGridSearch } from './queues/processors/gridSearch.js';
import { processWebsiteAudit } from './queues/processors/websiteAudit.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';
import { scraperQueue, auditQueue, setupQueues } from './queues/index.js';

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

// Initialize queues
// Remove environment variable check and use explicit URL
// if (!process.env.REDIS_URL) {
//   throw new Error('REDIS_URL environment variable is required');
// }

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
    version: process.version,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    headers: req.headers,
  };
  
  res.status(200).json(statusInfo);
});

// Add Redis connectivity diagnostic endpoint
app.get('/debug-redis', (req, res) => {
  const redisUrl = process.env.REDIS_URL || '';
  const externalUrl = "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:6379";
  
  const diagnosticInfo = {
    redis_url_exists: !!process.env.REDIS_URL,
    redis_url_masked: redisUrl.replace(/\/\/.*@/, '//***@'),
    redis_url_hostname: redisUrl.match(/@([^:]+):/)?.[1] || 'not-found',
    external_url_masked: externalUrl.replace(/\/\/.*@/, '//***@'),
    external_url_hostname: externalUrl.match(/@([^:]+):/)?.[1] || 'not-found',
    is_using_external_url: true,
    queue_status: {
      scraper_queue: scraperQueue.client.status || 'unknown',
      audit_queue: auditQueue.client.status || 'unknown'
    }
  };
  
  res.status(200).json(diagnosticInfo);
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
