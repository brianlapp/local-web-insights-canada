import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { QUEUE_NAMES, initializeQueues, createQueue } from './config.js';
import { getRedisClient } from '../config/redis.js';

// Queue instances
let queues: Record<string, Queue.Queue> = {};

// Initialize queues
export async function setupQueues(): Promise<void> {
  try {
    // First ensure Redis is connected
    const redis = await getRedisClient();
    await redis.ping(); // Test the connection
    logger.info('Redis connection verified');
    
    // Initialize queues with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        queues = await initializeQueues();
        logger.info('All queues initialized successfully', {
          queueCount: Object.keys(queues).length,
          queueNames: Object.values(QUEUE_NAMES)
        });
        break;
      } catch (error: any) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        logger.warn(`Queue initialization attempt ${retryCount} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      }
    }

    // Verify all required queues are available
    const requiredQueues = [QUEUE_NAMES.SCRAPER, QUEUE_NAMES.AUDIT, QUEUE_NAMES.DATA_PROCESSING];
    const missingQueues = requiredQueues.filter(name => !queues[name]);
    
    if (missingQueues.length > 0) {
      throw new Error(`Missing required queues: ${missingQueues.join(', ')}`);
    }

    // Set up queue processors
    const scraper = getQueue(QUEUE_NAMES.SCRAPER);
    const audit = getQueue(QUEUE_NAMES.AUDIT);

    // Set up processors
    scraper.process('search-grid', processGridSearch);
    audit.process('audit-website', processWebsiteAudit);

    logger.info('Queue processors initialized successfully');
  } catch (error: any) {
    logger.error('Failed to set up queues:', error);
    // Clear any partially initialized queues
    queues = {};
    throw error;
  }
}

// Get queue by name
function getQueue(name: string): Queue.Queue {
  // Try to get the queue by name or key
  const queue = queues[name] || queues[QUEUE_NAMES[name as keyof typeof QUEUE_NAMES]];
  
  if (!queue) {
    const error = new Error(`Queue ${name} not found`);
    logger.error('Queue not found:', { 
      name, 
      availableQueues: Object.keys(queues),
      queueNames: Object.values(QUEUE_NAMES)
    });
    throw error;
  }
  
  return queue;
}

// Export queue getters with improved error handling
export const scraperQueue = () => {
  try {
    return getQueue(QUEUE_NAMES.SCRAPER);
  } catch (error: any) {
    logger.error('Failed to get scraper queue:', error);
    throw new Error(`Scraper queue not available: ${error.message}`);
  }
};

export const auditQueue = () => {
  try {
    return getQueue(QUEUE_NAMES.AUDIT);
  } catch (error: any) {
    logger.error('Failed to get audit queue:', error);
    throw new Error(`Audit queue not available: ${error.message}`);
  }
};

export const dataProcessingQueue = () => {
  try {
    return getQueue(QUEUE_NAMES.DATA_PROCESSING);
  } catch (error: any) {
    logger.error('Failed to get data processing queue:', error);
    throw new Error(`Data processing queue not available: ${error.message}`);
  }
};

// Export queue names for consistency
export { QUEUE_NAMES };
