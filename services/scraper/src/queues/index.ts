import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';
import { QUEUE_NAMES, initializeQueues, createQueue } from './config.js';

// Queue instances
let queues: Record<string, Queue.Queue> = {};

// Initialize queues
export async function setupQueues(): Promise<void> {
  try {
    queues = await initializeQueues();
    logger.info('All queues initialized successfully');

    // Set up queue processors
    const scraper = getQueue(QUEUE_NAMES.SCRAPER);
    const audit = getQueue(QUEUE_NAMES.AUDIT);

    // Set up processors
    scraper.process('search-grid', processGridSearch);
    audit.process('audit-website', processWebsiteAudit);

    logger.info('Queue processors initialized successfully');
  } catch (error: any) {
    logger.error('Failed to set up queues:', error);
    throw error;
  }
}

// Get queue by name
function getQueue(name: string): Queue.Queue {
  const queue = queues[name];
  if (!queue) {
    throw new Error(`Queue ${name} not found`);
  }
  return queue;
}

// Export queue getters
export const scraperQueue = () => getQueue(QUEUE_NAMES.SCRAPER);
export const auditQueue = () => getQueue(QUEUE_NAMES.AUDIT);
export const dataProcessingQueue = () => getQueue(QUEUE_NAMES.DATA_PROCESSING);

// Export queue names for consistency
export { QUEUE_NAMES };
