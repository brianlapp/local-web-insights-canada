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
    connectTimeout: 10000,
    commandTimeout: 5000,
    enableOfflineQueue: true,
    reconnectOnError(err: Error) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  };

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

  // Test the connection
  try {
    await client.ping();
    logger.info('Redis connection test successful');
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    throw error;
  }

  return client;
}