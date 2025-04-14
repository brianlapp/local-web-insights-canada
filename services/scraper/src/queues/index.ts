import { Queue, Job } from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { QUEUE_NAMES, initializeQueues, createQueue } from './config.js';
import { getRedisClient } from '../config/redis.js';

// Define job data interfaces
export interface ScraperJobData {
  location: string;
  radius: number;
  searchTerm?: string;
  jobId?: string;
}

export interface AuditJobData {
  businessId: string;
  url: string;
  options?: {
    runLighthouse?: boolean;
    detectTechnologies?: boolean;
    takeScreenshots?: boolean;
    validateOnly?: boolean;
  };
}

// Store initialized queues with proper types
const queues: Record<string, Queue<any>> = {};

// Get a queue by name
export async function getQueue(name: string): Promise<Queue<any>> {
  // Try to get the queue by name directly
  if (queues[name]) {
    return queues[name];
  }

  // If not found, try to initialize it
  try {
    const queue = await createQueue(name);
    queues[name] = queue;
    return queue;
  } catch (error) {
    logger.error(`Failed to get queue ${name}:`, error);
    throw error;
  }
}

// Queue getters with proper types
export async function getScraperQueue(): Promise<Queue<ScraperJobData>> {
  try {
    return (await getQueue(QUEUE_NAMES.SCRAPER)) as Queue<ScraperJobData>;
  } catch (error) {
    logger.error('Failed to get scraper queue:', error);
    throw error;
  }
}

export async function getAuditQueue(): Promise<Queue<AuditJobData>> {
  try {
    return (await getQueue(QUEUE_NAMES.AUDIT)) as Queue<AuditJobData>;
  } catch (error) {
    logger.error('Failed to get audit queue:', error);
    throw error;
  }
}

export async function getDataProcessingQueue(): Promise<Queue> {
  try {
    return await getQueue(QUEUE_NAMES.DATA_PROCESSING);
  } catch (error) {
    logger.error('Failed to get data processing queue:', error);
    throw error;
  }
}

// Initialize queues and set up processors
export async function setupQueueProcessors(): Promise<void> {
  try {
    // Initialize queues
    await Promise.all([
      getScraperQueue(),
      getAuditQueue(),
      getDataProcessingQueue()
    ]);

    // Set up processors after queues are initialized
    const scraperQueue = await getScraperQueue();
    const auditQueue = await getAuditQueue();

    // Set up processors with proper job options
    scraperQueue.process(async (job: Job<ScraperJobData>) => {
      try {
        await processGridSearch(job);
      } catch (error) {
        logger.error('Error processing grid search job:', error);
        throw error;
      }
    });

    auditQueue.process(async (job: Job<AuditJobData>) => {
      try {
        await processWebsiteAudit(job);
      } catch (error) {
        logger.error('Error processing website audit job:', error);
        throw error;
      }
    });

    logger.info('All queues initialized and processors set up successfully');
  } catch (error) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }
}

// Export queue names for consistency
export { QUEUE_NAMES };

// Update the job options to use numbers for timeouts
const jobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  },
  removeOnComplete: true,
  removeOnFail: false,
  timeout: 300000 // 5 minutes in milliseconds
};

// Export setupQueues as an alias for setupQueueProcessors for backward compatibility
export const setupQueues = setupQueueProcessors;
