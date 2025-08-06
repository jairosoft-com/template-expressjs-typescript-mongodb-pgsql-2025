import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import config from '../config';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'An unexpected error occurred';

  // Determine status code and message based on error type
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    // Format Zod errors for a more user-friendly message
    const flattenedErrors = error.flatten();
    const fieldErrors = Object.entries(flattenedErrors.fieldErrors)
      .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
      .join(', ');
    message = fieldErrors || 'Validation failed';
  }

  // Log the error for debugging
  logger.error(
    `${statusCode} - ${message} - ${req?.originalUrl || 'unknown'} - ${req?.method || 'unknown'} - ${req?.ip || 'unknown'}`,
    { 
      stack: config.nodeEnv === 'development' ? error.stack : {},
      error: error.message 
    }
  );

  // In production, don't send detailed error messages to the client
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  // Return consistent error response format
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
