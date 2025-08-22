import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from '@/config';
import { errorMiddleware } from '@common/middleware/error.middleware';
import { ApiError } from '@common/utils/ApiError';
import { componentRegistry } from '@common/core/ComponentRegistry';
import { join } from 'path';
import { setupSwagger } from '@/config/swagger';
import {
  requestLogger,
  responseLogger,
  errorLogger,
  performanceMonitor,
} from '@common/middleware/logging.middleware';

// Phase 5: Microservices Architecture
import { apiGatewayService } from '@/services/api-gateway.service';

/**
 * Create and configure the Express application
 */
export const createApp = async (): Promise<Express> => {
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

  // Setup Swagger documentation
  setupSwagger(app);

  // Logging and monitoring middleware
  app.use(requestLogger);
  app.use(responseLogger);
  app.use(performanceMonitor);

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns the health status of the API
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthCheck'
   *             example:
   *               message: "API is healthy"
   *               timestamp: "2025-01-15T10:30:00Z"
   *               uptime: 12345.67
   *               environment: "development"
   *       500:
   *         description: API is unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               status: "error"
   *               statusCode: 500
   *               message: "API is unhealthy"
   */
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  });

  // Apply stricter rate limiting to authentication endpoints
  app.use('/api/v1/users/login', authLimiter);
  app.use('/api/v1/users/register', authLimiter);

  // Phase 5: API Gateway routing
  app.use('/api/v1/gateway', (req: Request, res: Response, next: NextFunction) => {
    apiGatewayService.routeRequest(req, res, next);
  });

  // Error Handling
  app.use((_req, _res, next) => next(new ApiError(404, 'Not Found')));
  app.use(errorLogger);
  app.use(errorMiddleware);

  return app;
};

/**
 * Initialize and mount components on the Express app
 */
export const initializeComponents = async (app: Express): Promise<void> => {
  // Auto-discover and register components
  const componentsPath = join(__dirname, 'components');
  await componentRegistry.autoDiscover(componentsPath);

  // Initialize all components
  await componentRegistry.initializeAll();

  // Mount component routes
  componentRegistry.mountRoutes(app);
  console.log(`Mounted ${componentRegistry.getStats().total} components`);
};

/**
 * Shutdown all components gracefully
 */
export const shutdownComponents = async (): Promise<void> => {
  try {
    await componentRegistry.shutdownAll();
    console.log('All components shut down gracefully');
  } catch (error) {
    console.error('Error shutting down components:', error);
  }
};

/**
 * Get the configured Express app instance
 */
export const getApp = async (): Promise<Express> => {
  const app = await createApp();
  await initializeComponents(app);
  return app;
};

export default getApp;
