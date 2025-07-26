import mongoose from 'mongoose';
import config from '../config';
import logger from '../utils/logger';

export const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(config.db.mongoUrl);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

export default mongoose;
