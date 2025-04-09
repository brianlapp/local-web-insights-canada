import Queue from 'bull';
import { logger } from '../utils/logger.js';
import { processGridSearch } from './processors/gridSearch.js';
import { processWebsiteAudit } from './processors/websiteAudit.js';

// Queue instances
export const scraperQueue = new Queue('business-scraper', process.env.REDIS_URL as string);
export const auditQueue = new Queue('website-audit', process.env.REDIS_URL as string);

export async function setupQueues() {
  logger.info('Setting up job queues...');

  // Set up scraper queue processor
  scraperQueue.process('search-grid', processGridSearch);

  // Set up audit queue processor
  auditQueue.process('audit-website', processWebsiteAudit);

  // Global error handlers
  scraperQueue.on('error', (error) => {
    logger.error('Scraper queue error:', error);
  });

  auditQueue.on('error', (error) => {
    logger.error('Audit queue error:', error);
  });

  // Job completion handlers
  scraperQueue.on('completed', (job) => {
    logger.info(`Completed scraper job ${job.id}`);
  });

  auditQueue.on('completed', (job) => {
    logger.info(`Completed audit job ${job.id}`);
  });

  // Job failure handlers
  scraperQueue.on('failed', (job, error) => {
    logger.error(`Failed scraper job ${job?.id}:`, error);
  });

  auditQueue.on('failed', (job, error) => {
    logger.error(`Failed audit job ${job?.id}:`, error);
  });

  logger.info('Job queues setup complete');
} 