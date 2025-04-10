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
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    timeout: 300000, // 5 minutes
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000 // Keep last 1000 completed jobs
    },
    removeOnFail: false
  },
  settings: {
    lockDuration: 30000,
    stalledInterval: 30000,
    maxStalledCount: 3,
    drainDelay: 5,
    lockRenewTime: 15000
  },
  limiter: {
    max: 5,
    duration: 10000,
    bounceBack: true // Queue jobs that exceed rate limit
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
      attempts: job.attemptsMade,
      data: job.data
    });

    // If job has remaining attempts, log retry information
    if (job.attemptsMade < QUEUE_CONFIG.defaultJobOptions.attempts) {
      const nextAttemptDelay = Math.pow(2, job.attemptsMade) * QUEUE_CONFIG.defaultJobOptions.backoff.delay;
      logger.info(`Job ${job.id} will retry in ${nextAttemptDelay}ms (attempt ${job.attemptsMade + 1}/${QUEUE_CONFIG.defaultJobOptions.attempts})`);
    }
  });

  queue.on('stalled', (jobId: string) => {
    logger.warn(`Job ${jobId} in queue ${name} has stalled`);
  });

  queue.on('completed', (job: Queue.Job) => {
    logger.info(`Job ${job.id} in queue ${name} completed successfully`, {
      jobId: job.id,
      queue: name,
      processingTime: job.finishedOn ? job.finishedOn - job.processedOn! : undefined,
      attempts: job.attemptsMade
    });
  });

  // Validate queue is operational
  try {
    await queue.isReady();
    const counts = await queue.getJobCounts();
    logger.info(`Queue ${name} initialized successfully`, { 
      status: 'ready',
      counts,
      redis: queue.client ? 'connected' : 'disconnected'
    });
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
    // Initialize queues in parallel
    const queuePromises = Object.entries(QUEUE_NAMES).map(async ([key, name]) => {
      try {
        queues[key] = await createQueue(name);
        logger.info(`Initialized queue: ${name}`);
      } catch (error: any) {
        logger.error(`Failed to initialize queue ${name}:`, error);
        throw error;
      }
    });

    await Promise.all(queuePromises);
  } catch (error: any) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }

  return queues;
} 