import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import logger from './utils/logger';
import { errorMiddleware } from './middleware/error.middleware';
import { ApiError } from './utils/ApiError';
import userRouter from './api/users/user.routes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'API is healthy' });
});
app.use('/api/v1/users', userRouter);

// Error Handling
app.use((_req, _res, next) => next(new ApiError(404, 'Not Found')));
app.use(errorMiddleware);

// Start Server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode.`);
});

export default app; // Export for testing
