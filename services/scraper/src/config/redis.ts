const Redis = require('ioredis');
import type { Redis as RedisType, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger.js';

// Connection URLs
const REDIS_CONFIG = {
  INTERNAL_URL: "redis://redis.railway.internal:6379",
  EXTERNAL_URL: "redis://default:KeMbhJaNOKbuIBnJmxXebZGUTsSYtdsE@shinkansen.proxy.rlwy.net:13781",
  CONNECTION_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CIRCUIT_BREAKER_TIMEOUT: 30000
};

// Redis connection options
const baseRedisOptions: RedisOptions = {
  connectTimeout: REDIS_CONFIG.CONNECTION_TIMEOUT,
  maxRetriesPerRequest: REDIS_CONFIG.MAX_RETRIES,
  enableReadyCheck: true,
  retryStrategy(times: number) {
    const delay = Math.min(times * REDIS_CONFIG.RETRY_DELAY, 3000);
    logger.info(`Redis connection retry attempt ${times} with delay ${delay}ms`);
    return delay;
  },
  reconnectOnError(err: Error) {
    logger.warn(`Redis reconnection triggered due to error: ${err.message}`);
    const targetError = err.message.includes('READONLY');
    return targetError;
  }
};

// Connection state tracking
let isConnected = false;
let lastConnectionAttempt = 0;
let circuitBroken = false;

export class RedisManager {
  private static instance: RedisManager;
  private client: RedisType | null = null;
  private connectionType: 'internal' | 'external' = 'internal';

  private constructor() {}

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async getClient(): Promise<RedisType> {
    if (this.client && isConnected) {
      return this.client;
    }

    const client = await this.establishConnection();
    return client;
  }

  private async establishConnection(): Promise<RedisType> {
    const now = Date.now();

    // Circuit breaker check
    if (circuitBroken && now - lastConnectionAttempt < REDIS_CONFIG.CIRCUIT_BREAKER_TIMEOUT) {
      throw new Error('Circuit breaker is active, connection attempts temporarily suspended');
    }

    lastConnectionAttempt = now;

    try {
      // Try internal connection first
      if (this.connectionType === 'internal') {
        try {
          const internalClient = new Redis(REDIS_CONFIG.INTERNAL_URL, baseRedisOptions);
          await this.testConnection(internalClient);
          this.client = internalClient;
          logger.info('Successfully connected to Redis using internal URL');
          return internalClient;
        } catch (error: any) {
          logger.warn(`Internal Redis connection failed, falling back to external URL: ${error.message}`);
          this.connectionType = 'external';
        }
      }

      // Try external connection
      const externalClient = new Redis(REDIS_CONFIG.EXTERNAL_URL, baseRedisOptions);
      await this.testConnection(externalClient);
      this.client = externalClient;
      logger.info('Successfully connected to Redis using external URL');
      return externalClient;

    } catch (error: any) {
      circuitBroken = true;
      logger.error(`Redis connection failed: ${error.message}`);
      throw error;
    }
  }

  private async testConnection(client: RedisType): Promise<void> {
    // Set up event handlers
    client.on('connect', () => {
      isConnected = true;
      circuitBroken = false;
      logger.info('Redis connected');
    });

    client.on('error', (error: Error) => {
      isConnected = false;
      logger.error(`Redis error: ${error.message}`);
    });

    client.on('close', () => {
      isConnected = false;
      logger.warn('Redis connection closed');
    });

    // Test connection
    const pingResult = await client.ping();
    if (pingResult !== 'PONG') {
      throw new Error('Redis ping failed');
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      isConnected = false;
    }
  }

  getConnectionStatus(): Record<string, any> {
    return {
      isConnected,
      connectionType: this.connectionType,
      circuitBroken,
      lastConnectionAttempt,
      clientStatus: this.client ? 'initialized' : 'not initialized'
    };
  }
}

export const getRedisClient = async (): Promise<RedisType> => {
  return RedisManager.getInstance().getClient();
};