import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../config/redis.js';

// Queue names
export const QUEUE_NAMES = {
  SCRAPER: 'scraper',
  AUDIT: 'audit',
  DATA_PROCESSING: 'data_processing'
};

// Queue configuration
export const QUEUE_CONFIG = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  },
  settings: {
    lockDuration: 30000,
    stalledInterval: 15000,
    maxStalledCount: 2,
    drainDelay: 5
  },
  limiter: {
    max: 3,
    duration: 5000
  }
};

// Queue creation with proper error handling
export async function createQueue(name: string): Promise<Queue.Queue> {
  const redis = await getRedisClient();
  
  const queue = new Queue(name, {
    createClient: () => redis,
    defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
    settings: QUEUE_CONFIG.settings,
    limiter: QUEUE_CONFIG.limiter
  });

  // Set up event handlers
  queue.on('error', (error: Error) => {
    logger.error(`Queue ${name} error: ${error.message}`, { error });
  });

  queue.on('failed', (job: Queue.Job, error: Error) => {
    logger.error(`Job ${job.id} in queue ${name} failed: ${error.message}`, {
      jobId: job.id,
      queue: name,
      error: error.message,
      stackTrace: error.stack,
      attempts: job.attemptsMade
    });
  });

  queue.on('stalled', (jobId: string) => {
    logger.warn(`Job ${jobId} in queue ${name} has stalled`);
  });

  queue.on('completed', (job: Queue.Job) => {
    logger.info(`Job ${job.id} in queue ${name} completed successfully`);
  });

  // Validate queue is operational
  try {
    await queue.isReady();
    logger.info(`Queue ${name} initialized successfully`);
  } catch (error: any) {
    logger.error(`Failed to initialize queue ${name}: ${error.message}`);
    throw error;
  }

  return queue;
}

// Initialize all queues
export async function initializeQueues(): Promise<Record<string, Queue.Queue>> {
  const queues: Record<string, Queue.Queue> = {};
  
  try {
    for (const [key, name] of Object.entries(QUEUE_NAMES)) {
      queues[key] = await createQueue(name);
      logger.info(`Initialized queue: ${name}`);
    }
  } catch (error: any) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }

  return queues;
} 