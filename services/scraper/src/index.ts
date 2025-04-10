import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { processGridSearch } from './queues/processors/gridSearch.js';
import { processWebsiteAudit } from './queues/processors/websiteAudit.js';
import { setupDataProcessingQueue } from './processors/dataProcessor.js';
import { getSupabaseClient } from './utils/database.js';
import { setupQueues, scraperQueue, auditQueue } from './queues/index.js';
import { RedisManager } from './config/redis.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis connection
    await RedisManager.getInstance().getClient();
    logger.info('Redis connection initialized');

    // Initialize queues
    await setupQueues();
    logger.info('Job queues initialized');

    // Set up queue processors
    const scraper = scraperQueue();
    const audit = auditQueue();

    scraper.process('search-grid', processGridSearch);
    audit.process('audit-website', processWebsiteAudit);

    // Initialize Supabase client
    getSupabaseClient();
    logger.info('Supabase client initialized');

    // Set up routes
    const router = setupRoutes(scraper, audit, setupDataProcessingQueue());
    app.use('/api', router);
    logger.info('Routes initialized');

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

// Start server
initializeServices().then(() => {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}).catch((error: any) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
}); 
