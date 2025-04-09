import express from 'express';
import Queue from 'bull';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { processGridSearch } from './queues/processors/gridSearch.js';
import { processWebsiteAudit } from './queues/processors/websiteAudit.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';

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
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

const scraperQueue = new Queue('scraper', process.env.REDIS_URL as string);
const auditQueue = new Queue('audit', process.env.REDIS_URL as string);

// Set up queue processors
scraperQueue.process('search-grid', processGridSearch);
auditQueue.process('audit-website', processWebsiteAudit);

// Set up data processing queue
const dataProcessingQueue = setupDataProcessingQueue();

// Handle queue errors
scraperQueue.on('error', (error) => {
  logger.error('Scraper queue error:', error);
});

auditQueue.on('error', (error) => {
  logger.error('Audit queue error:', error);
});

// Handle completed jobs
scraperQueue.on('completed', async (job) => {
  logger.info(`Completed scraper job ${job.id}`);
  
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

auditQueue.on('completed', (job) => {
  logger.info(`Completed audit job ${job.id}`);
});

// Handle failed jobs
scraperQueue.on('failed', async (job, error) => {
  logger.error(`Scraper job ${job.id} failed:`, error);
  
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

auditQueue.on('failed', (job, error) => {
  logger.error(`Audit job ${job.id} failed:`, error);
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
