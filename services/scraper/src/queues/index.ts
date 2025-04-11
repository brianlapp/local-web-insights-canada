import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { QUEUE_NAMES, initializeQueues, createQueue } from './config.js';
import { getRedisClient } from '../config/redis.js';

// Store initialized queues
const queues: Record<string, Queue.Queue> = {};

// Get a queue by name
export function getQueue(name: string): Queue.Queue {
  // Try to get the queue by name directly
  if (queues[name]) {
    return queues[name];
  }
  
  // Try to get the queue by key (case-insensitive)
  const key = Object.keys(queues).find(k => k.toLowerCase() === name.toLowerCase());
  if (key) {
    return queues[key];
  }
  
  // Try to get the queue by value (case-insensitive)
  const queueKey = Object.entries(QUEUE_NAMES).find(([_, value]) => 
    value.toLowerCase() === name.toLowerCase()
  )?.[0];
  
  if (queueKey && queues[queueKey]) {
    return queues[queueKey];
  }
  
  // Log available queues for debugging
  logger.error('Queue lookup failed. Available queues:', {
    queueKeys: Object.keys(queues),
    queueNames: Object.values(QUEUE_NAMES),
    requestedName: name
  });
  
  throw new Error(`Queue ${name} not found`);
}

// Queue getters
export function getScraperQueue(): Queue.Queue {
  try {
    return getQueue(QUEUE_NAMES.SCRAPER);
  } catch (error: any) {
    logger.error('Failed to get scraper queue:', error);
    throw new Error('Scraper queue not available');
  }
}

export function getAuditQueue(): Queue.Queue {
  try {
    return getQueue(QUEUE_NAMES.AUDIT);
  } catch (error: any) {
    logger.error('Failed to get audit queue:', error);
    throw new Error('Audit queue not available');
  }
}

export function getDataProcessingQueue(): Queue.Queue {
  try {
    return getQueue(QUEUE_NAMES.DATA_PROCESSING);
  } catch (error: any) {
    logger.error('Failed to get data processing queue:', error);
    throw new Error('Data processing queue not available');
  }
}

// Initialize queues
export async function setupQueues(): Promise<void> {
  try {
    // Verify Redis connection first
    const redis = await getRedisClient();
    await redis.ping();
    logger.info('Redis connection verified');
    
    // Initialize queues with retry logic
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // Initialize all queues
        await initializeQueues();
        
        // Verify that all required queues are available
        const requiredQueues = Object.values(QUEUE_NAMES);
        const missingQueues = requiredQueues.filter(name => {
          try {
            getQueue(name);
            return false;
          } catch {
            return true;
          }
        });
        
        if (missingQueues.length > 0) {
          throw new Error(`Missing required queues: ${missingQueues.join(', ')}`);
        }
        
        logger.info('All queues initialized and verified');
        
        // Set up queue processors
        setupQueueProcessors();
        
        return;
      } catch (error: any) {
        retries++;
        logger.error(`Queue initialization attempt ${retries} failed:`, error);
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      }
    }
  } catch (error: any) {
    logger.error('Failed to set up queues:', error);
    throw error;
  }
}

// Set up queue processors
function setupQueueProcessors(): void {
  const scraper = getScraperQueue();
  const audit = getAuditQueue();

  // Set up processors
  scraper.process('search-grid', processGridSearch);
  audit.process('audit-website', processWebsiteAudit);

  logger.info('Queue processors initialized successfully');
}

// Export queue names for consistency
export { QUEUE_NAMES };
