import Redis from 'ioredis';
import type { Redis as RedisType, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';

// Try different Redis URL configurations in order of preference
const REDIS_URL = process.env.REDIS_URL || // Private URL (preferred)
                 process.env.REDIS_PRIVATE_URL || // Railway private URL
                 process.env.REDIS_PUBLIC_URL || // Railway public URL (fallback)
                 'redis://localhost:6379'; // Local development only

const REDIS_RETRY_STRATEGY_MAX_RETRIES = 5;
const REDIS_RETRY_STRATEGY_MAX_DELAY = 5000;

export async function getRedisClient(): Promise<RedisType> {
  // Return existing client if available
  if (global.redisClient) {
    return global.redisClient;
  }

  // Parse the Redis URL to determine if we're using TLS
  const isSecure = REDIS_URL.startsWith('rediss://');
  const isRailwayProxy = REDIS_URL.includes('proxy.rlwy.net');
  const isProd = process.env.NODE_ENV === 'production';
  const redisHost = new URL(REDIS_URL).hostname;

  logger.info("Redis config", {
    REDIS_URL: REDIS_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
    isSecure,
    isRailwayProxy,
    host: redisHost
  });

  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    family: 0, // Let Node.js choose the IP version that works
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
  };

  // Log TLS configuration decision
  const shouldUseTLS = REDIS_URL.startsWith("rediss://") || REDIS_URL.includes("proxy.rlwy.net");
  logger.info('TLS config:', shouldUseTLS ? 'enabled' : 'disabled', {
    reason: isSecure ? 'rediss:// URL' : (isRailwayProxy ? 'Railway proxy' : 'not needed')
  });

  // Enable TLS for secure connections and Railway proxy
  if (shouldUseTLS) {
    options.tls = {
      rejectUnauthorized: false, // Required for Railway's self-signed certs
      servername: redisHost
    };
  }

  logger.info("Final Redis client options", { 
    options: {
      ...options,
      tls: options.tls ? 'configured' : 'disabled',
      host: redisHost,
      family: options.family
    }
  });
  
  try {
    // Create Redis client instance
    const redis = new (Redis as any)(REDIS_URL, options);

    // Add event listeners for better monitoring
    redis.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redis.on('ready', () => {
      logger.info('Redis client ready and connected');
    });

    redis.on('error', (err: Error) => {
      logger.error('Redis client error:', { 
        error: err.message,
        stack: err.stack,
        code: (err as any).code
      });
    });

    redis.on('close', () => {
      logger.warn('Redis client closed connection');
      global.redisClient = null; // Clear the global reference when connection closes
    });

    redis.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    redis.on('end', () => {
      logger.warn('Redis connection ended');
      global.redisClient = null; // Clear the global reference when connection ends
    });

    // Test the connection
    await redis.connect();
    const pingResult = await Promise.race([
      redis.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis ping timeout')), 10000)
      )
    ]);

    if (pingResult === 'PONG') {
      logger.info('Redis connection test successful');
      global.redisClient = redis; // Store the client globally
      return redis;
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