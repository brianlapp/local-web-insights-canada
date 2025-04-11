
import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { QUEUE_NAMES, initializeQueues, createQueue } from './config.js';
import { getRedisClient } from '../config/redis.js';

// Queue instances
let queues: Record<string, Queue.Queue> = {};

// Initialize queues with improved error handling and detailed logging
export async function setupQueues(): Promise<void> {
  try {
    // First ensure Redis is connected
    const redis = await getRedisClient();
    await redis.ping(); // Test the connection
    logger.info('Redis connection verified');
    
    // Initialize queues with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    // Log the queue names we're trying to initialize
    logger.info('Attempting to initialize queues', {
      queueNames: Object.values(QUEUE_NAMES)
    });
    
    while (retryCount < maxRetries) {
      try {
        // Initialize queues
        queues = await initializeQueues();
        
        // Log the keys of the initialized queues object
        logger.info('Queues initialized with keys:', {
          keys: Object.keys(queues)
        });
        
        // Verify all required queues are available
        const requiredQueues = [QUEUE_NAMES.SCRAPER, QUEUE_NAMES.AUDIT, QUEUE_NAMES.DATA_PROCESSING];
        const availableQueueNames = Object.keys(queues);
        
        // Log which queues we expect and which we have
        logger.info('Queue verification', {
          required: requiredQueues,
          available: availableQueueNames
        });
        
        const missingQueues = requiredQueues.filter(name => 
          !availableQueueNames.includes(name) && 
          !availableQueueNames.includes(QUEUE_NAMES[name as keyof typeof QUEUE_NAMES])
        );
        
        if (missingQueues.length > 0) {
          throw new Error(`Missing required queues: ${missingQueues.join(', ')}`);
        }

        // Set up queue processors
        const scraper = getQueue(QUEUE_NAMES.SCRAPER);
        const audit = getQueue(QUEUE_NAMES.AUDIT);

        // Set up processors
        scraper.process('search-grid', processGridSearch);
        audit.process('audit-website', processWebsiteAudit);

        logger.info('All queues initialized successfully', {
          queueCount: Object.keys(queues).length,
          queueNames: Object.values(QUEUE_NAMES),
          processors: ['search-grid', 'audit-website']
        });
        
        break;
      } catch (error: any) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        logger.warn(`Queue initialization attempt ${retryCount} failed, retrying...`, { 
          error: error.message,
          stack: error.stack 
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      }
    }
  } catch (error: any) {
    logger.error('Failed to set up queues:', error);
    throw error;
  }
}

// Improved queue getter with more detailed error info
function getQueue(name: string): Queue.Queue {
  const queuesByName = queues;
  
  // Try to get the queue directly by name
  if (queuesByName[name]) {
    return queuesByName[name];
  }
  
  // Try to get by QUEUE_NAMES enum lookup if it's a key
  const enumKey = name as keyof typeof QUEUE_NAMES;
  if (QUEUE_NAMES[enumKey] && queuesByName[QUEUE_NAMES[enumKey]]) {
    return queuesByName[QUEUE_NAMES[enumKey]];
  }
  
  // Log detailed debug information
  logger.error('Queue not found:', { 
    requestedName: name, 
    availableQueues: Object.keys(queuesByName),
    queueNames: Object.values(QUEUE_NAMES)
  });
  
  throw new Error(`Queue ${name} not found`);
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
