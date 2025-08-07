import { IComponentService } from '@common/types/component';
import { createChildLogger } from '@common/utils/logger';
import { Logger } from 'pino';
import { ApiError } from '@common/utils/ApiError';

/**
 * Abstract base class for component services
 * Provides common service functionality
 */
export abstract class BaseService implements IComponentService {
  protected readonly logger: Logger;
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = createChildLogger(`service:${serviceName}`);
  }

  /**
   * Optional initialization method
   */
  public async initialize(): Promise<void> {
    this.logger.debug(`Service initialized: ${this.serviceName}`);
  }

  /**
   * Optional cleanup method
   */
  public async cleanup(): Promise<void> {
    this.logger.debug(`Service cleanup: ${this.serviceName}`);
  }

  /**
   * Execute operation with retry logic
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          { err: error, attempt, maxRetries },
          `Operation failed, attempt ${attempt}/${maxRetries}`
        );
        
        if (attempt < maxRetries) {
          await this.delay(delay * attempt);
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Execute operation with timeout
   */
  protected async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ApiError(408, `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    return Promise.race([operation(), timeoutPromise]);
  }

  /**
   * Cache wrapper for operations
   */
  protected async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // This is a placeholder for cache implementation
    // In a real implementation, you would check cache first
    // For now, just execute the operation
    return operation();
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch process items with configurable batch size
   */
  protected async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Validate input data
   */
  protected validateInput<T>(
    data: any,
    validator: (data: any) => data is T
  ): T {
    if (!validator(data)) {
      throw ApiError.badRequest('Invalid input data');
    }
    return data;
  }

  /**
   * Log and throw error
   */
  protected throwError(
    message: string,
    statusCode: number = 500,
    context?: any
  ): never {
    const error = new ApiError(statusCode, message, true, context);
    this.logger.error({ err: error, context }, message);
    throw error;
  }
}