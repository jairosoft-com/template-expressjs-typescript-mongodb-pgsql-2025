import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
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

// Start Server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode.`);
});

export default app; // Export for testing
