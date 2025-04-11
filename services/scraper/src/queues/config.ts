import Queue from 'bull';
import { Redis, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';
import { getRedisClient, createRedisClient } from '../config/redis.js';
import { getSupabaseClient } from '../utils/database.js';

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
      delay: 5000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200 // Keep last 200 failed jobs
  },
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 1 // Number of times a job can be marked as stalled before being failed
  },
  limiter: {
    max: 5, // Maximum number of jobs processed concurrently
    duration: 10000 // Time window in milliseconds
  }
};

// Initialize queues with each queue getting its own Redis clients
export async function initializeQueues(): Promise<Record<string, Queue.Queue>> {
  try {
    // Create queues with dedicated Redis clients for each queue
    const queues: Record<string, Queue.Queue> = {};
    
    // Create scraper queue with its own Redis clients
    queues[QUEUE_NAMES.SCRAPER] = new Queue(QUEUE_NAMES.SCRAPER, {
      createClient: (type) => {
        logger.info(`Creating new Redis client for ${QUEUE_NAMES.SCRAPER} queue (type: ${type})`);
        return createRedisClient();
      },
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
      settings: QUEUE_CONFIG.settings,
      limiter: QUEUE_CONFIG.limiter
    });
    
    // Create audit queue with its own Redis clients
    queues[QUEUE_NAMES.AUDIT] = new Queue(QUEUE_NAMES.AUDIT, {
      createClient: (type) => {
        logger.info(`Creating new Redis client for ${QUEUE_NAMES.AUDIT} queue (type: ${type})`);
        return createRedisClient();
      },
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
      settings: QUEUE_CONFIG.settings,
      limiter: QUEUE_CONFIG.limiter
    });
    
    // Create data processing queue with its own Redis clients
    queues[QUEUE_NAMES.DATA_PROCESSING] = new Queue(QUEUE_NAMES.DATA_PROCESSING, {
      createClient: (type) => {
        logger.info(`Creating new Redis client for ${QUEUE_NAMES.DATA_PROCESSING} queue (type: ${type})`);
        return createRedisClient();
      },
      defaultJobOptions: {
        ...QUEUE_CONFIG.defaultJobOptions,
        timeout: 600000 // 10 minutes for data processing
      },
      settings: QUEUE_CONFIG.settings,
      limiter: {
        ...QUEUE_CONFIG.limiter,
        max: 3, // Lower concurrency for data processing
        duration: 15000 // Longer duration between jobs
      }
    });
    
    // Set up event handlers for all queues
    for (const [name, queue] of Object.entries(queues)) {
      setupQueueEventHandlers(queue, name);
    }
    
    logger.info('All queues initialized successfully', {
      queueCount: Object.keys(queues).length,
      queueNames: Object.keys(queues)
    });
    
    return queues;
  } catch (error: any) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }
}

// Set up event handlers for a queue
function setupQueueEventHandlers(queue: Queue.Queue, name: string): void {
  queue.on('error', (error: Error) => {
    logger.error(`Queue ${name} error:`, error);
  });
  
  queue.on('failed', (job: Queue.Job, error: Error) => {
    logger.error(`Job ${job.id} in queue ${name} failed:`, {
      error: error.message,
      jobId: job.id,
      data: job.data,
      attempts: job.attemptsMade
    });
  });
  
  queue.on('completed', (job: Queue.Job) => {
    logger.info(`Job ${job.id} in queue ${name} completed successfully`, {
      jobId: job.id,
      processingTime: job.finishedOn ? job.finishedOn - job.processedOn! : undefined,
      attempts: job.attemptsMade
    });
  });
  
  queue.on('stalled', (jobId: string) => {
    logger.warn(`Job ${jobId} in queue ${name} has stalled`);
  });
  
  queue.on('waiting', (jobId: string) => {
    logger.info(`Job ${jobId} in queue ${name} is waiting`);
  });
  
  queue.on('active', (job: Queue.Job) => {
    logger.info(`Job ${job.id} in queue ${name} has started processing`);
  });
}

// Queue creation with proper error handling
export async function createQueue(name: string, options: Partial<Queue.QueueOptions> = {}): Promise<Queue.Queue> {
  // Create a unique Redis client for this queue
  const queue = new Queue(name, {
    createClient: (type) => {
      logger.info(`Creating new Redis client for queue ${name} (type: ${type})`);
      return createRedisClient();
    },
    defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
    settings: QUEUE_CONFIG.settings,
    limiter: QUEUE_CONFIG.limiter,
    ...options
  });

  // Set up event handlers
  setupQueueEventHandlers(queue, name);

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
