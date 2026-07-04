import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { correlationMiddleware } from './utils/correlation';
import { requestLoggerMiddleware } from './middleware/requestLoggerMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import routes from './routes';
import { logger } from './utils/logger';
import { prisma } from './database/prisma';
import { jobQueue } from './services/jobs/JobQueue';
import { StrategyEngineService } from './services/growth/StrategyEngineService';
import { MarketingEngineService } from './services/growth/MarketingEngineService';
import { LeadEngineService } from './services/growth/LeadEngineService';
import { SalesEngineService } from './services/growth/SalesEngineService';
import { AnalyticsEngineService } from './services/growth/AnalyticsEngineService';
import { CustomerSuccessService } from './services/growth/CustomerSuccessService';

const app = express();

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

// Register Downstream Engine Job Workers
jobQueue.registerWorker('STRATEGY_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[STRATEGY_ENGINE] Starting background run for business: ${payload.businessId}`);
  return StrategyEngineService.generateStrategy(payload.businessId);
});

jobQueue.registerWorker('MARKETING_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[MARKETING_ENGINE] Starting background run for business: ${payload.businessId}`);
  return MarketingEngineService.generateMarketingPlan(payload.businessId);
});

jobQueue.registerWorker('LEAD_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[LEAD_ENGINE] Starting background run for business: ${payload.businessId}`);
  return LeadEngineService.runLeadEngine(payload.businessId);
});

jobQueue.registerWorker('SALES_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[SALES_ENGINE] Starting background run for business: ${payload.businessId}`);
  return SalesEngineService.runSalesEngine(payload.businessId);
});

jobQueue.registerWorker('ANALYTICS_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[ANALYTICS_ENGINE] Starting background run for business: ${payload.businessId}`);
  return AnalyticsEngineService.runAnalyticsEngine(payload.businessId);
});

jobQueue.registerWorker('CUSTOMER_SUCCESS_ENGINE', async (payload: { businessId: string }) => {
  logger.info(`[CUSTOMER_SUCCESS_ENGINE] Starting background run for business: ${payload.businessId}`);
  return CustomerSuccessService.runCustomerSuccessEngine(payload.businessId);
});

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
