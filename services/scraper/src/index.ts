import express from 'express';
import Queue from 'bull';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { setupRoutes } from './routes';
import { processGridSearch } from './queues/processors/gridSearch';
import { processWebsiteAudit } from './queues/processors/websiteAudit';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize queues
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

const scraperQueue = new Queue('scraper', process.env.REDIS_URL);
const auditQueue = new Queue('audit', process.env.REDIS_URL);

// Set up queue processors
scraperQueue.process('search-grid', processGridSearch);
auditQueue.process('audit-website', processWebsiteAudit);

// Handle queue errors
scraperQueue.on('error', (error) => {
  logger.error('Scraper queue error:', error);
});

auditQueue.on('error', (error) => {
  logger.error('Audit queue error:', error);
});

// Handle failed jobs
scraperQueue.on('failed', (job, error) => {
  logger.error(`Scraper job ${job.id} failed:`, error);
});

auditQueue.on('failed', (job, error) => {
  logger.error(`Audit job ${job.id} failed:`, error);
});

// Set up routes
app.use('/api', setupRoutes(scraperQueue, auditQueue));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
}); 