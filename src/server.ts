import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
import { connectPostgres, closePostgres } from './database/postgres';
import { connectMongo, closeMongo } from './database/mongo';
import { connectRedis, closeRedis } from './database/redis';
import { errorMiddleware } from './middleware/error.middleware';
import { ApiError } from './utils/ApiError';
import userRouter from './api/users/user.routes';

const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));

// General rate limiting for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many authentication attempts, please try again later.',
  },
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'API is healthy' });
});

// Apply stricter rate limiting to authentication endpoints
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/register', authLimiter);

app.use('/api/v1/users', userRouter);

// Error Handling
app.use((_req, _res, next) => next(new ApiError(404, 'Not Found')));
app.use(errorMiddleware);

/**
 * Start the server with database connections
 */
const startServer = async () => {
  try {
    // Connect to all data sources
    logger.info('Connecting to databases...');
    await connectPostgres();
    await connectMongo();
    await connectRedis();
    logger.info('All database connections established');

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      // Stop accepting new requests
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        try {
          await closePostgres();
          await closeMongo();
          await closeRedis();
          logger.info('All database connections closed');
        } catch (error) {
          logger.error('Error closing database connections:', error);
        }
        
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app; // Export for testing
