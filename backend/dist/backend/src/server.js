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
// Start Server
app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
});
exports.default = app;
