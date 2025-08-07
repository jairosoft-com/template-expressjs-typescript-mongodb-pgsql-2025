import { PrismaClient } from '@prisma/client';
import prisma from '@/database/prisma';
import { createChildLogger } from '@common/utils/logger';
import { Logger } from 'pino';

/**
 * Base repository class providing common database operations
 * All repositories should extend this class
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected logger: Logger;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
    this.logger = createChildLogger(`repository:${modelName}`);
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      this.logger.error({ err: error, id }, `Error finding ${this.modelName} by ID`);
      throw error;
    }
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<T[]> {
    try {
      const result = await (this.prisma as any)[this.modelName].findMany(params);
      return result;
    } catch (error) {
      this.logger.error({ err: error, params }, `Error finding ${this.modelName} records`);
      throw error;
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(where?: any): Promise<number> {
    try {
      const result = await (this.prisma as any)[this.modelName].count({ where });
      return result;
    } catch (error) {
      this.logger.error({ err: error, where }, `Error counting ${this.modelName} records`);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({ data });
      this.logger.info({ id: result.id }, `${this.modelName} created`);
      return result;
    } catch (error) {
      this.logger.error({ err: error, data }, `Error creating ${this.modelName}`);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });
      this.logger.info({ id }, `${this.modelName} updated`);
      return result;
    } catch (error) {
      this.logger.error({ err: error, id, data }, `Error updating ${this.modelName}`);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
      this.logger.info({ id }, `${this.modelName} deleted`);
      return result;
    } catch (error) {
      this.logger.error({ err: error, id }, `Error deleting ${this.modelName}`);
      throw error;
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(where?: any): Promise<{ count: number }> {
    try {
      const result = await (this.prisma as any)[this.modelName].deleteMany({ where });
      this.logger.info({ count: result.count }, `${this.modelName} records deleted`);
      return result;
    } catch (error) {
      this.logger.error({ err: error, where }, `Error deleting ${this.modelName} records`);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    try {
      const result = await this.prisma.$transaction(fn);
      return result;
    } catch (error) {
      this.logger.error({ err: error }, `Transaction failed for ${this.modelName}`);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error) {
      this.logger.error({ err: error, where }, `Error checking existence for ${this.modelName}`);
      throw error;
    }
  }
}
