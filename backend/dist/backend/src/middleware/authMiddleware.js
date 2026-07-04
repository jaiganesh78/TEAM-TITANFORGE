"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorMiddleware_1 = require("./errorMiddleware");
function requireAuth(req, res, next) {
    let token;
    // 1. Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Check cookies
    if (!token && req.cookies) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return next(new errorMiddleware_1.AppError('Authentication token is required', 401, 'UNAUTHORIZED'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new errorMiddleware_1.AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED'));
        }
        return next(new errorMiddleware_1.AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorMiddleware_1.AppError('Authentication is required to check role', 401, 'UNAUTHORIZED'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errorMiddleware_1.AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
        }
        next();
    };
}
