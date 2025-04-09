import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';

// Centralized queue name configuration
export const QUEUE_NAMES = {
  SCRAPER: 'scraper',
  AUDIT: 'audit'
};

// Log Redis connection info (with credentials masked)
const redisUrl = process.env.REDIS_URL || '';
logger.info(`Redis URL configured: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
logger.info(`Redis hostname: ${redisUrl.match(/@([^:]+):/)?.[1] || 'not-found'}`);

// Queue instances
export const scraperQueue = new Queue(QUEUE_NAMES.SCRAPER, process.env.REDIS_URL as string);
export const auditQueue = new Queue(QUEUE_NAMES.AUDIT, process.env.REDIS_URL as string);

export async function setupQueues() {
  logger.info('Setting up job queues...');
  logger.info(`Using queue names: ${QUEUE_NAMES.SCRAPER}, ${QUEUE_NAMES.AUDIT}`);

  // Set up scraper queue processor
  scraperQueue.process('search-grid', processGridSearch);

  // Set up audit queue processor
  auditQueue.process('audit-website', processWebsiteAudit);

  // Global error handlers
  scraperQueue.on('error', (error) => {
    logger.error(`Scraper queue error: ${error.message}`, { error });
  });

  auditQueue.on('error', (error) => {
    logger.error(`Audit queue error: ${error.message}`, { error });
  });

  // Job completion handlers
  scraperQueue.on('completed', (job) => {
    logger.info(`Completed scraper job ${job.id}`);
  });

  auditQueue.on('completed', (job) => {
    logger.info(`Completed audit job ${job.id}`);
  });

  // Job failure handlers
  scraperQueue.on('failed', (job, error) => {
    logger.error(`Failed scraper job ${job?.id}: ${error.message}`, { error });
  });

  auditQueue.on('failed', (job, error) => {
    logger.error(`Failed audit job ${job?.id}: ${error.message}`, { error });
  });

  logger.info('Job queues setup complete');
} 