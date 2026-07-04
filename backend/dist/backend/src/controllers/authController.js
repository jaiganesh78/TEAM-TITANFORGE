"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authValidators_1 = require("../validators/authValidators");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
class AuthController {
    async register(req, res, next) {
        try {
            const body = authValidators_1.registerSchema.parse(req.body);
            const result = await authService_1.authService.register({
                name: body.name,
                email: body.email,
                passwordHash: body.password,
                organizationName: body.organizationName,
            }, req.ip, req.correlationId);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const body = authValidators_1.loginSchema.parse(req.body);
            const result = await authService_1.authService.login({
                email: body.email,
                passwordHash: body.password,
            }, req.ip, req.correlationId);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                throw new errorMiddleware_1.AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
            }
            const result = await authService_1.authService.refresh(refreshToken, req.ip, req.correlationId);
            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await authService_1.authService.logout(refreshToken, req.ip, req.correlationId);
            }
            res.clearCookie('refreshToken');
            res.status(200).json({
                success: true,
                data: { message: 'Logged out successfully' },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async me(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Not authenticated', 401, 'UNAUTHORIZED');
            }
            res.status(200).json({
                success: true,
                data: {
                    user: req.user,
                },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
