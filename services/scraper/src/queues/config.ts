import Redis from 'ioredis';
import * as Bull from 'bull';
import type { Queue as BullQueue, QueueOptions, Job } from 'bull';
import { RedisOptions } from 'ioredis';
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
    removeOnComplete: 100,
    removeOnFail: 100,
    timeout: 300000 // 5 minutes
  },
  settings: {
    lockDuration: 300000, // 5 minutes
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 2,
    guardInterval: 5000, // Poll interval for delayed jobs
    retryProcessDelay: 5000, // Delay before retrying job if process crashes
    drainDelay: 5000 // Delay between processing jobs when queue is being drained
  },
  limiter: {
    max: 5,
    duration: 5000,
    bounceBack: true // Queue jobs that exceed rate limit
  }
};

// Create a Redis client factory for Bull
export const createRedisClientFactory = () => {
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
    const client = new (Redis as any)(REDIS_URL, options);
    
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

// Queue event handlers
const setupQueueEventHandlers = (queue: BullQueue, queueName: string) => {
  queue.on('error', (job: Job<any>, error: Error) => {
    logger.error(`Queue ${queueName} error:`, error);
  });

  queue.on('failed', (job: Job<any>, error: Error) => {
    logger.error(`Job ${job.id} in queue ${queueName} failed:`, {
      jobId: job.id,
      queueName,
      error: error.message,
      attemptsMade: job.attemptsMade,
      data: job.data
    });

    // Update job status in database if it's a scraper job
    if (queueName === QUEUE_NAMES.SCRAPER && job.data.jobId) {
      try {
        const supabase = getSupabaseClient();
        void supabase
          .from('scraper_runs')
          .update({ 
            status: 'failed',
            error: error.message
          })
          .eq('id', job.data.jobId);
      } catch (updateError) {
        logger.error(`Failed to update job status for ${job.id}:`, updateError);
      }
    }
  });

  queue.on('completed', (job: Job<any>) => {
    logger.info(`Job ${job.id} in queue ${queueName} completed successfully`, {
      jobId: job.id,
      queueName,
      data: job.data
    });

    // Update job status in database if it's a scraper job
    if (queueName === QUEUE_NAMES.SCRAPER && job.data.jobId) {
      try {
        const supabase = getSupabaseClient();
        void supabase
          .from('scraper_runs')
          .update({ 
            status: 'completed',
            businessesFound: job.data.businesses?.length || 0
          })
          .eq('id', job.data.jobId);
      } catch (error) {
        logger.error(`Failed to update job status for ${job.id}:`, error);
      }
    }
  });

  queue.on('stalled', (job: Job<any>) => {
    logger.warn(`Job ${job.id} in queue ${queueName} has stalled`);
  });

  return queue;
};

// Queue creation with proper error handling
export const createQueue = <T = any>(name: string, options: QueueOptions = {}): BullQueue<T> => {
  const redisClientFactory = createRedisClientFactory();
  
  // @ts-ignore - Fix for ESM compatibility
  const queue = new Bull.default(name, {
    createClient: (type: 'client' | 'subscriber' | 'bclient') => {
      return redisClientFactory(type);
    },
    ...options
  });

  setupQueueEventHandlers(queue, name);
  return queue;
};

// Initialize all queues
export async function initializeQueues(): Promise<Record<string, BullQueue>> {
  const queues: Record<string, BullQueue> = {};
  
  try {
    // Initialize queues in parallel
    const queuePromises = Object.entries(QUEUE_NAMES).map(async ([key, name]) => {
      try {
        // Create the queue with explicit name
        const queue = createQueue(name);
        
        // Store by both key and name for easier lookup
        queues[key] = queue;
        queues[name] = queue;
        
        logger.info(`Initialized queue: ${name} (key: ${key})`);
      } catch (error: any) {
        logger.error(`Failed to initialize queue ${name}:`, error);
        throw error;
      }
    });

    await Promise.all(queuePromises);
    
    // Log all available queues for debugging
    logger.info('All queues initialized successfully', {
      queueKeys: Object.keys(queues).filter(k => Object.keys(QUEUE_NAMES).includes(k)),
      queueNames: Object.values(QUEUE_NAMES)
    });
  } catch (error: any) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }

  return queues;
} 