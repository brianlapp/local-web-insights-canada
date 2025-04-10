import Queue from 'bull';
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

// Queue event handlers
const setupQueueEventHandlers = (queue: Queue.Queue, queueName: string) => {
  queue.on('error', (error: Error) => {
    logger.error(`Queue ${queueName} error:`, error);
  });

  queue.on('failed', async (job: Queue.Job, error: Error) => {
    logger.error(`Job ${job.id} in queue ${queueName} failed:`, {
      jobId: job.id,
      queue: queueName,
      error: error.message,
      stackTrace: error.stack,
      attempts: job.attemptsMade,
      data: job.data
    });

    // Update job status in database if it's a scraper job
    if (queueName === QUEUE_NAMES.SCRAPER && job.data.jobId) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('scraper_runs')
          .update({ 
            status: 'failed',
            error: error.message
          })
          .eq('id', job.data.jobId);
      } catch (updateError: any) {
        logger.error(`Failed to update job status for ${job.id}:`, updateError);
      }
    }
  });

  queue.on('completed', async (job: Queue.Job) => {
    logger.info(`Job ${job.id} in queue ${queueName} completed successfully`, {
      jobId: job.id,
      queue: queueName,
      processingTime: job.finishedOn ? job.finishedOn - job.processedOn! : undefined,
      attempts: job.attemptsMade
    });

    // Update job status in database if it's a scraper job
    if (queueName === QUEUE_NAMES.SCRAPER && job.data.jobId) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('scraper_runs')
          .update({ 
            status: 'completed',
            businessesFound: job.data.businesses?.length || 0
          })
          .eq('id', job.data.jobId);
      } catch (error: any) {
        logger.error(`Failed to update job status for ${job.id}:`, error);
      }
    }
  });

  queue.on('stalled', (jobId: string) => {
    logger.warn(`Job ${jobId} in queue ${queueName} has stalled`);
  });

  return queue;
};

// Queue creation with proper error handling
export async function createQueue(name: string, options: Partial<Queue.QueueOptions> = {}): Promise<Queue.Queue> {
  const redis = await getRedisClient();
  
  const queue = new Queue(name, {
    createClient: () => redis,
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