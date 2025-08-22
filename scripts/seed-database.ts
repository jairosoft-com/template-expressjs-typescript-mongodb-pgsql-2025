import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import logger from '@common/utils/logger';
import { connectPostgres, closePostgres } from '@/database/postgres';
import { connectRedis, closeRedis } from '@/database/redis';

// Sample user data for seeding
const seedUsers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    email: 'bob.wilson@example.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Wilson',
  },
  {
    email: 'alice.johnson@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Johnson',
  },
];

const seedPostgres = async () => {
  try {
    logger.info('Seeding PostgreSQL database...');

    // Add PostgreSQL seeding logic here when you have PostgreSQL models
    // For now, we'll just log that PostgreSQL seeding is ready
    logger.info('PostgreSQL seeding completed (no models to seed yet)');
  } catch (error) {
    logger.error({ error }, 'Error seeding PostgreSQL');
    throw error;
  }
};

const seedRedis = async () => {
  try {
    logger.info('Seeding Redis database...');

    // Add Redis seeding logic here when you have Redis data to seed
    // For now, we'll just log that Redis seeding is ready
    logger.info('Redis seeding completed (no data to seed yet)');
  } catch (error) {
    logger.error({ error }, 'Error seeding Redis');
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Connect to databases
    await connectPostgres();
    await connectRedis();

    // Seed each database
    await seedPostgres();
    await seedRedis();

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error({ error }, 'Database seeding failed');
    process.exit(1);
  } finally {
    // Close database connections
    await closePostgres();
    await closeRedis();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, seedUsers };
