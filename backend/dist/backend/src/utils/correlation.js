"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRELATION_HEADER = void 0;
exports.correlationMiddleware = correlationMiddleware;
const crypto_1 = require("crypto");
exports.CORRELATION_HEADER = 'x-correlation-id';
function correlationMiddleware(req, res, next) {
    const correlationId = req.header(exports.CORRELATION_HEADER) || (0, crypto_1.randomUUID)();
    req.correlationId = correlationId;
    res.setHeader(exports.CORRELATION_HEADER, correlationId);
    next();
}
