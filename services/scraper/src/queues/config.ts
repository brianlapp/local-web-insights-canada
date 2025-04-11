import Queue from 'bull';
import { Redis, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../config/redis.js';
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

// Create a Redis client factory for Bull
const createRedisClientFactory = () => {
  // Get the Redis URL from environment
  const REDIS_URL = process.env.REDIS_URL || 
                   process.env.REDIS_PRIVATE_URL || 
                   process.env.REDIS_PUBLIC_URL || 
                   'redis://localhost:6379';
  
  // Parse the Redis URL to determine if we're using TLS
  const isSecure = REDIS_URL.startsWith('rediss://');
  const isRailwayProxy = REDIS_URL.includes('proxy.rlwy.net');
  const redisHost = new URL(REDIS_URL).hostname;
  
  // Base Redis options
  const options: RedisOptions = {
    maxRetriesPerRequest: null, // Disable max retries per request (required by Bull)
    family: 0, // Let Node.js choose the IP version that works
    retryStrategy(times: number) {
      if (times > 5) {
        logger.error('Max Redis connection retries reached');
        return null; // stop retrying
      }
      const delay = Math.min(times * 1000, 5000);
      logger.info(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
    connectTimeout: 20000,
    commandTimeout: 10000,
    enableOfflineQueue: true,
    enableReadyCheck: false, // Disable ready check (required by Bull)
    lazyConnect: true, // Only connect when needed,
    tls: undefined // Will be set conditionally below
  };
  
  // Enable TLS for secure connections and Railway proxy
  if (isSecure || isRailwayProxy) {
    options.tls = {
      rejectUnauthorized: false, // Required for Railway's self-signed certs
      servername: redisHost
    };
  }
  
  // Return a factory function that creates a new Redis client for each type
  return (type: 'client' | 'subscriber' | 'bclient') => {
    logger.info(`Creating new Redis client for Bull queue (type: ${type})`);
    const client = new Redis(REDIS_URL, options);
    
    // Add event listeners for better monitoring
    client.on('connect', () => {
      logger.info(`Redis client connecting... (type: ${type})`);
    });

    client.on('ready', () => {
      logger.info(`Redis client ready and connected (type: ${type})`);
    });

    client.on('error', (err: Error) => {
      logger.error(`Redis client error (type: ${type}):`, { 
        error: err.message,
        stack: err.stack,
        code: (err as any).code
      });
    });

    client.on('close', () => {
      logger.warn(`Redis client closed connection (type: ${type})`);
    });

    client.on('reconnecting', () => {
      logger.info(`Redis client reconnecting (type: ${type})`);
    });

    client.on('end', () => {
      logger.warn(`Redis connection ended (type: ${type})`);
    });
    
    return client;
  };
};

// Initialize queues
export async function initializeQueues(): Promise<Record<string, Queue.Queue>> {
  try {
    // Create the Redis client factory
    const createClient = createRedisClientFactory();
    
    // Create queues with the client factory
    const queues: Record<string, Queue.Queue> = {};
    
    // Create scraper queue
    queues[QUEUE_NAMES.SCRAPER] = new Queue(QUEUE_NAMES.SCRAPER, {
      createClient,
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
      settings: QUEUE_CONFIG.settings,
      limiter: QUEUE_CONFIG.limiter
    });
    
    // Create audit queue
    queues[QUEUE_NAMES.AUDIT] = new Queue(QUEUE_NAMES.AUDIT, {
      createClient,
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
      settings: QUEUE_CONFIG.settings,
      limiter: QUEUE_CONFIG.limiter
    });
    
    // Create data processing queue
    queues[QUEUE_NAMES.DATA_PROCESSING] = new Queue(QUEUE_NAMES.DATA_PROCESSING, {
      createClient,
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
  // Create the Redis client factory
  const createClient = createRedisClientFactory();
  
  const queue = new Queue(name, {
    createClient,
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