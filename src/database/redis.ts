import { createClient, RedisClientType } from 'redis';
import config from '../config';
import logger from '../utils/logger';

// Global variable to store the Redis client (singleton pattern)
const globalForRedis = global as unknown as {
  redisClient: RedisClientType | undefined;
};

let redisClient: RedisClientType;

// Implement singleton pattern for Redis client
if (process.env.NODE_ENV === 'production') {
  redisClient = createClient({ url: config.redis.url });
} else {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createClient({ url: config.redis.url });
  }
  redisClient = globalForRedis.redisClient;
}

// Redis client event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('end', () => {
  logger.warn('Redis client connection ended');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

/**
 * Connect to Redis and verify connection
 */
export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    logger.info('Redis already connected');
    return;
  }

  try {
    await redisClient.connect();
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

/**
 * Check Redis connection health
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

export default redisClient;
