import { Pool } from 'pg';
import config from '../config';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: config.db.postgresUrl,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const connectPostgres = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

export default pool;
