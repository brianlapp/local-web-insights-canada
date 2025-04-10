import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { RedisOptions } from 'ioredis';
import { QUEUE_NAMES, initializeQueues } from './config.js';

// Queue instances
let queues: Record<string, Queue.Queue> = {};

// Initialize queues
export async function setupQueues(): Promise<void> {
  try {
    queues = await initializeQueues();
    logger.info('All queues initialized successfully');
  } catch (error: any) {
    logger.error('Failed to set up queues:', error);
    throw error;
  }
}

// Get queue by name
export function getQueue(name: string): Queue.Queue {
  const queue = queues[name];
  if (!queue) {
    throw new Error(`Queue ${name} not found`);
  }
  return queue;
}

// Export queue instances
export const scraperQueue = () => getQueue(QUEUE_NAMES.SCRAPER);
export const auditQueue = () => getQueue(QUEUE_NAMES.AUDIT);
export const dataProcessingQueue = () => getQueue(QUEUE_NAMES.DATA_PROCESSING);

// Export queue names for consistency
export { QUEUE_NAMES };

// Centralized queue name configuration
export const QUEUE_NAMES_OLD = {
  SCRAPER: 'scraper',
  AUDIT: 'audit',
  DATA_PROCESSING: 'data_processing'
};

// Define connection options for both internal and external Redis
const INTERNAL_REDIS_URL = "redis://redis.railway.internal:6379";
const EXTERNAL_REDIS_URL = "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:13781";

// Try to use internal DNS first, fall back to external URL
// This should allow service discovery to work properly
const redisUrl = INTERNAL_REDIS_URL;

// Log which Redis URL we're using
logger.info(`Attempting Redis connection using internal DNS: ${INTERNAL_REDIS_URL}`);
logger.info(`Fallback Redis URL (external): ${EXTERNAL_REDIS_URL.replace(/\/\/.*@/, '//***@')}`);

// Connection options for Bull queues
const bullOptions = {
  redis: {
    // No specific Redis options here - using the URL handles it
  },
  // Bull-specific settings
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 15000, // Check for stalled jobs every 15 seconds
    maxStalledCount: 2, // Maximum number of times a job can be marked as stalled
    drainDelay: 5, // Delay for draining the queue when paused
  },
  // Very important - limit retries to avoid hammering Redis
  limiter: {
    max: 3, // Maximum number of jobs processed in duration
    duration: 5000, // Duration in ms for limiting
  }
};

// Circuit breaker to track Redis connection state
let redisCircuitBroken = false;
let lastConnectionAttempt = 0;
const CIRCUIT_RESET_INTERVAL = 30000; // 30 seconds

// Create queues with proper error handling
function createQueue(name: string) {
  const queue = new Queue(name, redisUrl);
  
  queue.on('error', (error) => {
    const now = Date.now();
    logger.error(`${name} queue error: ${error.message}`, { error });
    
    // Circuit breaker logic
    if (!redisCircuitBroken) {
      logger.warn(`Redis circuit breaker tripped for ${name} queue`);
      redisCircuitBroken = true;
      lastConnectionAttempt = now;
    } else if (now - lastConnectionAttempt > CIRCUIT_RESET_INTERVAL) {
      // Try to reset circuit after interval
      logger.info(`Attempting to reset Redis circuit breaker for ${name} queue`);
      lastConnectionAttempt = now;
    }
  });
  
  return queue;
}

// Create queues with circuit breaker pattern
export const scraperQueueOld = createQueue(QUEUE_NAMES_OLD.SCRAPER);
export const dataProcessingQueueOld = createQueue(QUEUE_NAMES_OLD.DATA_PROCESSING);
export const auditQueueOld = createQueue(QUEUE_NAMES_OLD.AUDIT);

export async function setupQueuesOld() {
  logger.info('Setting up job queues...');
  logger.info(`Using queue names: ${QUEUE_NAMES_OLD.SCRAPER}, ${QUEUE_NAMES_OLD.AUDIT}`);

  // Set up scraper queue processor
  scraperQueueOld.process('search-grid', processGridSearch);

  // Set up audit queue processor
  auditQueueOld.process('audit-website', processWebsiteAudit);

  // Global error handlers
  scraperQueueOld.on('error', (error) => {
    logger.error(`Scraper queue error: ${error.message}`, { error });
  });

  auditQueueOld.on('error', (error) => {
    logger.error(`Audit queue error: ${error.message}`, { error });
  });

  // Job completion handlers
  scraperQueueOld.on('completed', (job) => {
    logger.info(`Completed scraper job ${job.id}`);
  });

  auditQueueOld.on('completed', (job) => {
    logger.info(`Completed audit job ${job.id}`);
  });

  // Job failure handlers
  scraperQueueOld.on('failed', (job, error) => {
    logger.error(`Failed scraper job ${job?.id}: ${error.message}`, { error });
  });

  auditQueueOld.on('failed', (job, error) => {
    logger.error(`Failed audit job ${job?.id}: ${error.message}`, { error });
  });

  logger.info('Job queues setup complete');
} 