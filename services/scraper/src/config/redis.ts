import { Redis, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_RETRY_STRATEGY_MAX_RETRIES = 10;
const REDIS_RETRY_STRATEGY_MAX_DELAY = 5000;

export async function getRedisClient(): Promise<Redis> {
  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > REDIS_RETRY_STRATEGY_MAX_RETRIES) {
        logger.error('Max Redis connection retries reached');
        return null; // stop retrying
      }
      const delay = Math.min(times * 1000, REDIS_RETRY_STRATEGY_MAX_DELAY);
      logger.info(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
    connectTimeout: 30000, // Increased timeout for Railway
    commandTimeout: 10000, // Increased timeout for Railway
    enableOfflineQueue: true,
    enableReadyCheck: true,
    reconnectOnError(err: Error) {
      const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'];
      if (targetErrors.some(e => err.message.includes(e))) {
        logger.warn(`Reconnecting due to error: ${err.message}`);
        return true;
      }
      return false;
    },
    tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  };

  logger.info(`Initializing Redis connection to ${REDIS_URL}`);
  const client = new Redis(REDIS_URL, options);

  // Add event listeners for better monitoring
  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('error', (err: Error) => {
    logger.error('Redis client error:', err);
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('close', () => {
    logger.warn('Redis client closed connection');
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting');
  });

  client.on('end', () => {
    logger.warn('Redis connection ended');
  });

  // Test the connection with a longer timeout
  try {
    const pingPromise = client.ping();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis ping timeout')), 20000);
    });

    await Promise.race([pingPromise, timeoutPromise]);
    logger.info('Redis connection test successful');
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    throw error;
  }

  return client;
}