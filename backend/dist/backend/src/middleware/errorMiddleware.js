"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(message, statusCode = 400, errorCode = 'BAD_REQUEST', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function errorMiddleware(err, req, res, next) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details = null;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Input validation failed';
        details = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
    }
    else {
        // Log actual stack trace for unhandled errors
        (0, logger_1.logRequest)(req, 'error', `Unhandled Exception: ${err.message}\nStack: ${err.stack}`);
    }
    // Log error response
    if (statusCode >= 500) {
        (0, logger_1.logRequest)(req, 'error', `Response Error 500: ${message}`);
    }
    else {
        (0, logger_1.logRequest)(req, 'warn', `Response Warning ${statusCode}: ${message} (${errorCode})`);
    }
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: errorCode,
            details,
        },
        correlationId: req.correlationId,
    });
}
