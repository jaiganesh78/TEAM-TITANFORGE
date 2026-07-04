"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const correlation_1 = require("./utils/correlation");
const requestLoggerMiddleware_1 = require("./middleware/requestLoggerMiddleware");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./utils/logger");
const prisma_1 = require("./database/prisma");
const JobQueue_1 = require("./services/jobs/JobQueue");
const StrategyEngineService_1 = require("./services/growth/StrategyEngineService");
const MarketingEngineService_1 = require("./services/growth/MarketingEngineService");
const LeadEngineService_1 = require("./services/growth/LeadEngineService");
const SalesEngineService_1 = require("./services/growth/SalesEngineService");
const AnalyticsEngineService_1 = require("./services/growth/AnalyticsEngineService");
const CustomerSuccessService_1 = require("./services/growth/CustomerSuccessService");
const app = (0, express_1.default)();
// Middlewares
app.use(correlation_1.correlationMiddleware);
app.use((0, cors_1.default)({
    origin: true, // Allow all origins for development, adjust for production
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(requestLoggerMiddleware_1.requestLoggerMiddleware);
// Mount API routes
app.use('/api', routes_1.default);
// Error Handler Middleware
app.use(errorMiddleware_1.errorMiddleware);
// Register Downstream Engine Job Workers
JobQueue_1.jobQueue.registerWorker('STRATEGY_ENGINE', async (payload) => {
    logger_1.logger.info(`[STRATEGY_ENGINE] Starting background run for business: ${payload.businessId}`);
    return StrategyEngineService_1.StrategyEngineService.generateStrategy(payload.businessId);
});
JobQueue_1.jobQueue.registerWorker('MARKETING_ENGINE', async (payload) => {
    logger_1.logger.info(`[MARKETING_ENGINE] Starting background run for business: ${payload.businessId}`);
    return MarketingEngineService_1.MarketingEngineService.generateMarketingPlan(payload.businessId);
});
JobQueue_1.jobQueue.registerWorker('LEAD_ENGINE', async (payload) => {
    logger_1.logger.info(`[LEAD_ENGINE] Starting background run for business: ${payload.businessId}`);
    return LeadEngineService_1.LeadEngineService.runLeadEngine(payload.businessId);
});
JobQueue_1.jobQueue.registerWorker('SALES_ENGINE', async (payload) => {
    logger_1.logger.info(`[SALES_ENGINE] Starting background run for business: ${payload.businessId}`);
    return SalesEngineService_1.SalesEngineService.runSalesEngine(payload.businessId);
});
JobQueue_1.jobQueue.registerWorker('ANALYTICS_ENGINE', async (payload) => {
    logger_1.logger.info(`[ANALYTICS_ENGINE] Starting background run for business: ${payload.businessId}`);
    return AnalyticsEngineService_1.AnalyticsEngineService.runAnalyticsEngine(payload.businessId);
});
JobQueue_1.jobQueue.registerWorker('CUSTOMER_SUCCESS_ENGINE', async (payload) => {
    logger_1.logger.info(`[CUSTOMER_SUCCESS_ENGINE] Starting background run for business: ${payload.businessId}`);
    return CustomerSuccessService_1.CustomerSuccessService.runCustomerSuccessEngine(payload.businessId);
});
// Start Server
app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
    // Eager connection warm-up
    logger_1.logger.info('Initializing eager connection to database pool...');
    prisma_1.prisma.$connect()
        .then(() => logger_1.logger.info('Database pool successfully connected and warmed up.'))
        .catch((err) => logger_1.logger.error('Database connection pool warm-up failed:', err));
});
exports.default = app;
