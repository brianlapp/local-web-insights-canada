import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';

// Centralized queue name configuration
export const QUEUE_NAMES = {
  SCRAPER: 'scraper',
  AUDIT: 'audit'
};

// Ensure we use the external Redis URL, not the internal DNS
// This overrides any automatically set environment variables
const EXTERNAL_REDIS_URL = "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:6379";
// Ensure we always use the external URL, not env vars
const redisUrl = EXTERNAL_REDIS_URL;

// Log Redis connection info (with credentials masked)
logger.info(`Using explicit Redis URL: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
logger.info(`Redis hostname: ${redisUrl.match(/@([^:]+):/)?.[1] || 'not-found'}`);

// Queue instances with explicit Redis URL
export const scraperQueue = new Queue(QUEUE_NAMES.SCRAPER, redisUrl);
export const auditQueue = new Queue(QUEUE_NAMES.AUDIT, redisUrl);

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