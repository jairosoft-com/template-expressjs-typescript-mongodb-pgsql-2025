import { Request, Response, NextFunction } from 'express';
import logger from '@common/utils/logger';

interface RequestLog {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  body?: any;
  query?: any;
  params?: any;
}

interface ResponseLog {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  requestId: string;
  userId?: string;
  contentLength?: number;
}

interface ErrorLog {
  method: string;
  url: string;
  statusCode: number;
  error: string;
  stack?: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  responseTime: number;
}

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract user ID from JWT token if present
 */
const extractUserId = (req: Request): string | undefined => {
  try {
    // This is a simplified version - in a real app, you'd decode the JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // For now, we'll just return a placeholder
      // In a real implementation, you'd decode the JWT and extract the user ID
      return 'user_id_from_token';
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

/**
 * Sanitize sensitive data from request body
 */
const sanitizeBody = (body: any): any => {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID
  req.requestId = generateRequestId();
  req.startTime = Date.now();
  
  // Extract user ID if available
  const userId = extractUserId(req);
  
  // Create request log
  const requestLog: RequestLog = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    userId,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
  };
  
  // Log request
  logger.info('Incoming request', {
    ...requestLog,
    type: 'request',
    level: 'info',
  });
  
  next();
};

/**
 * Response logging middleware
 */
export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const userId = extractUserId(req);
  
  res.send = function(body) {
    const responseTime = Date.now() - req.startTime;
    
    // Create response log
    const responseLog: ResponseLog = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      userId,
      contentLength: body ? Buffer.byteLength(body, 'utf8') : 0,
    };
    
    // Log response
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    logger.log(logLevel, 'Outgoing response', {
      ...responseLog,
      type: 'response',
      level: logLevel,
    });
    
    // Call original send method
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const responseTime = Date.now() - req.startTime;
  const userId = extractUserId(req);
  
  // Create error log
  const errorLog: ErrorLog = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode || 500,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    userId,
    responseTime,
  };
  
  // Log error
  logger.error('Request error', {
    ...errorLog,
    type: 'error',
    level: 'error',
  });
  
  next(error);
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: Math.round(duration),
        statusCode: res.statusCode,
        requestId: req.requestId,
        type: 'performance',
        level: 'warn',
      });
    }
    
    // Log performance metrics for all requests
    logger.info('Request performance', {
      method: req.method,
      url: req.url,
      duration: Math.round(duration),
      statusCode: res.statusCode,
      requestId: req.requestId,
      type: 'performance',
      level: 'info',
    });
  });
  
  next();
};

/**
 * Health check logging middleware
 */
export const healthCheckLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health check endpoints to reduce noise
  if (req.url === '/' || req.url === '/health') {
    return next();
  }
  
  // For all other requests, use the standard logging
  requestLogger(req, res, next);
};

export default {
  requestLogger,
  responseLogger,
  errorLogger,
  performanceMonitor,
  healthCheckLogger,
};
