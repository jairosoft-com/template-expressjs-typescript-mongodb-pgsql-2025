import config from '@/config';
import logger from '@common/utils/logger';
import { connectPostgres, closePostgres } from '@/database/postgres';
import { connectRedis, closeRedis } from '@/database/redis';
import { ApiError } from '@common/utils/ApiError';
import { getApp, shutdownComponents } from '@/app';

// Phase 5: Real-time Features
import { socketService } from '@/services/socket.service';
import { eventService } from '@/services/event.service';

// Phase 5: Advanced Security
import { oauthService } from '@/services/oauth.service';

// Phase 5: Microservices Architecture
import { serviceDiscoveryService } from '@/services/service-discovery.service';

/**
 * Start the server with database connections
 */
const startServer = async () => {
  try {
    // Connect to all data sources (skip in test mode if SKIP_DB_CONNECTION is set)
    if (process.env.SKIP_DB_CONNECTION !== 'true') {
      logger.info('Connecting to databases...');
      await connectPostgres();
      await connectRedis();
      logger.info('All database connections established');
    } else {
      logger.info('Skipping database connections (SKIP_DB_CONNECTION=true)');
    }

    // Get the configured Express app
    const app = await getApp();
    logger.info('Express app configured and components initialized');

    // Phase 5: Initialize services
    logger.info('Initializing Phase 5 services...');

    // Initialize OAuth service
    oauthService.initialize();
    logger.info('OAuth service initialized');

    // Initialize service discovery
    serviceDiscoveryService.registerService({
      id: 'api-gateway-main',
      name: 'api-gateway',
      version: '1.0.0',
      host: 'localhost',
      port: config.port,
      health: 'healthy',
      metadata: {
        environment: config.nodeEnv,
        features: ['oauth', '2fa', 'websocket', 'microservices'],
      },
      endpoints: ['/api/v1/*'],
    });
    logger.info('Service discovery initialized');

    // Emit system startup event
    await eventService.emitEvent('system.startup', {
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0',
    });

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
      logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
      logger.info(
        `Readiness probe available at http://localhost:${config.port}/api/v1/health/ready`
      );
      logger.info(`Liveness probe available at http://localhost:${config.port}/api/v1/health/live`);
      logger.info(`WebSocket available at ws://localhost:${config.port}`);
      logger.info(`OAuth providers: ${oauthService.getAvailableProviders().join(', ')}`);
    });

    // Phase 5: Initialize Socket.IO
    socketService.initialize(server);
    logger.info('Socket.IO server initialized');

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      // Emit system shutdown event
      await eventService.emitEvent('system.shutdown', {
        signal,
        timestamp: new Date().toISOString(),
      });

      // Stop accepting new requests
      server.close(async () => {
        logger.info('HTTP server closed');

        // Shutdown all components
        try {
          await shutdownComponents();
        } catch (error) {
          logger.error({ error }, 'Error shutting down components');
        }

        // Close database connections
        try {
          await closePostgres();
          await closeRedis();
          logger.info('All database connections closed');
        } catch (error) {
          logger.error({ error }, 'Error closing database connections');
        }

        // Stop services
        serviceDiscoveryService.stop();
        logger.info('Service discovery stopped');

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
      // Check if it's an operational error
      if (ApiError.isOperationalError(error)) {
        logger.error({ err: error }, 'Operational error (uncaught)');
      } else {
        // Programming error - should restart
        logger.fatal({ err: error }, 'FATAL: Uncaught Exception - Programming Error');
      }

      // Emit system error event
      eventService.emitEvent('system.error', {
        error: error.message,
        stack: error.stack,
        isOperational: ApiError.isOperationalError(error),
        timestamp: new Date().toISOString(),
      });

      // Always shutdown for uncaught exceptions
      shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      // Convert reason to Error if it's not already
      const error = reason instanceof Error ? reason : new Error(String(reason));

      // Check if it's an operational error
      if (ApiError.isOperationalError(error)) {
        logger.error({ err: error, promise }, 'Operational error (unhandled rejection)');
      } else {
        // Programming error - should restart
        logger.fatal(
          { err: error, promise },
          'FATAL: Unhandled Promise Rejection - Programming Error'
        );
      }

      // Emit system error event
      eventService.emitEvent('system.error', {
        error: 'Unhandled Promise Rejection',
        reason: error.message,
        isOperational: ApiError.isOperationalError(error),
        timestamp: new Date().toISOString(),
      });

      // Always shutdown for unhandled rejections
      shutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Start the server
startServer();
