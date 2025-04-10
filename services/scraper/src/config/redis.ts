import { Redis, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';

// Try Railway's internal Redis first, fallback to env var
const REDIS_URL = process.env.REDIS_URL || 'redis://redis.railway.internal:6379';
const REDIS_RETRY_STRATEGY_MAX_RETRIES = 5;
const REDIS_RETRY_STRATEGY_MAX_DELAY = 5000;

export async function getRedisClient(): Promise<Redis> {
  // Parse the Redis URL to determine if we're using TLS
  const isSecure = REDIS_URL.startsWith('rediss://');
  const isProd = process.env.NODE_ENV === 'production';

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
    connectTimeout: 20000,
    commandTimeout: 10000,
    enableOfflineQueue: true,
    enableReadyCheck: true,
    lazyConnect: true, // Only connect when needed
    tls: isSecure ? {
      rejectUnauthorized: false, // Required for Railway's self-signed certs
      servername: new URL(REDIS_URL).hostname
    } : undefined,
    reconnectOnError(err: Error) {
      const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'];
      if (targetErrors.some(e => err.message.includes(e))) {
        logger.warn(`Reconnecting due to error: ${err.message}`);
        return true;
      }
      return false;
    }
  };

  logger.info(`Initializing Redis connection to ${REDIS_URL} (Production: ${isProd}, Secure: ${isSecure})`);
  
  try {
    const client = new Redis(REDIS_URL, options);

    // Add event listeners for better monitoring
    client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    client.on('ready', () => {
      logger.info('Redis client ready and connected');
    });

    client.on('error', (err: Error) => {
      logger.error('Redis client error:', { 
        error: err.message,
        stack: err.stack,
        code: (err as any).code
      });
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

    // Test the connection
    await client.connect();
    const pingResult = await Promise.race([
      client.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis ping timeout')), 10000)
      )
    ]);

    if (pingResult === 'PONG') {
      logger.info('Redis connection test successful');
      return client;
    } else {
      throw new Error('Redis ping failed');
    }
  } catch (error) {
    logger.error('Redis connection failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: REDIS_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      options: {
        ...options,
        tls: options.tls ? 'configured' : 'disabled'
      }
    });
    throw error;
  }
}