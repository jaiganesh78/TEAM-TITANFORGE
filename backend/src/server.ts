import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { correlationMiddleware } from './utils/correlation';
import { requestLoggerMiddleware } from './middleware/requestLoggerMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

import { prisma } from './database/prisma';

// Middlewares
app.use(correlationMiddleware);
app.use(cors({
  origin: true, // Allow all origins for development, adjust for production
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLoggerMiddleware);

// Mount API routes
app.use('/api', routes);

// Error Handler Middleware
app.use(errorMiddleware);

// Start Server
app.listen(env.PORT, () => {
  logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  
  // Eager connection warm-up
  logger.info('Initializing eager connection to database pool...');
  prisma.$connect()
    .then(() => logger.info('Database pool successfully connected and warmed up.'))
    .catch((err) => logger.error('Database connection pool warm-up failed:', err));
});

export default app;
