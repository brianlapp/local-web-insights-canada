import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { RedisOptions } from 'ioredis';

// Centralized queue name configuration
export const QUEUE_NAMES = {
  SCRAPER: 'scraper',
  AUDIT: 'audit'
};

// Ensure we use the external Redis URL, not the internal DNS
// This overrides any automatically set environment variables
const EXTERNAL_REDIS_URL = "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:13781";
// Ensure we always use the external URL, not env vars
const redisUrl = EXTERNAL_REDIS_URL;

// Configure Bull connection options
const connectionOptions = {
  // Retry strategy with exponential backoff
  retryStrategy: (times: number) => {
    const delay = Math.min(Math.exp(times), 30) * 1000; // Exponential with max 30 seconds
    logger.info(`Redis retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  // Increase connection timeout
  connectTimeout: 10000, // 10 seconds
  // Maximum reconnection attempts before failing
  maxRetriesPerRequest: 5
};

// Connection options for Bull queues
const bullOptions = {
  redis: {
    port: 13781,
    host: 'shinkansen.proxy.rlwy.net',
    password: 'KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE',
    username: 'default',
    connectTimeout: 10000,
    maxRetriesPerRequest: 5,
  },
  // Bull-specific settings
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 15000, // Check for stalled jobs every 15 seconds
    maxStalledCount: 2, // Maximum number of times a job can be marked as stalled
    backoffStrategies: {
      // Custom exponential backoff
      custom: (attemptsMade: number) => {
        return attemptsMade ? Math.min(Math.exp(attemptsMade - 1), 30) * 1000 : 1000;
      }
    }
  }
};

// Log Redis connection info (with credentials masked)
logger.info(`Using explicit Redis URL: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
logger.info(`Redis hostname: ${redisUrl.match(/@([^:]+):/)?.[1] || 'not-found'}`);

// Create queue instances with retry options
export const scraperQueue = new Queue(QUEUE_NAMES.SCRAPER, redisUrl, bullOptions);
scraperQueue.on('error', (error) => {
  logger.error(`Scraper queue error: ${error.message}`, { error });
  // Do not crash the process on queue errors
});

// Data processing queue
export const dataProcessingQueue = new Queue(QUEUE_NAMES.AUDIT, redisUrl, bullOptions);
dataProcessingQueue.on('error', (error) => {
  logger.error(`Data processing queue error: ${error.message}`, { error });
  // Do not crash the process on queue errors
});

// Audit queue
export const auditQueue = new Queue(QUEUE_NAMES.AUDIT, redisUrl, bullOptions);
auditQueue.on('error', (error) => {
  logger.error(`Audit queue error: ${error.message}`, { error });
  // Do not crash the process on queue errors
});

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