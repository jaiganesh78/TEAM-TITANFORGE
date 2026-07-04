"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = requestLoggerMiddleware;
const logger_1 = require("../utils/logger");
function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
        if (statusCode >= 500) {
            (0, logger_1.logRequest)(req, 'error', message);
        }
        else if (statusCode >= 400) {
            (0, logger_1.logRequest)(req, 'warn', message);
        }
        else {
            (0, logger_1.logRequest)(req, 'info', message);
        }
    });
    next();
}
