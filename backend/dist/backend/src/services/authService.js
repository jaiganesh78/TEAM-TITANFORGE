"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const userRepository_1 = require("../repositories/userRepository");
const organizationRepository_1 = require("../repositories/organizationRepository");
const sessionRepository_1 = require("../repositories/sessionRepository");
const auditLogRepository_1 = require("../repositories/auditLogRepository");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const client_1 = require("@prisma/client");
class AuthService {
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRY });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
        }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRY });
    }
    async register(data, ipAddress, correlationId) {
        // Check if email already exists
        const existingUser = await userRepository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new errorMiddleware_1.AppError('Email address is already in use', 409, 'EMAIL_IN_USE');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(data.passwordHash, 10);
        // Create Organization and User within a transaction (implied or direct, since we have single repository calls we will run sequentially or let Prisma handle)
        const organization = await organizationRepository_1.organizationRepository.create({
            name: data.organizationName,
        });
        const user = await userRepository_1.userRepository.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: client_1.Role.OWNER, // The creator of the organization is always OWNER
            organization: {
                connect: { id: organization.id }
            }
        });
        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        // Create Session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching REFRESH_TOKEN_EXPIRY
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: refreshToken,
            expiresAt,
        });
        // Write Audit Log
        await auditLogRepository_1.auditLogRepository.create({
            user: { connect: { id: user.id } },
            organization: { connect: { id: organization.id } },
            action: 'USER_REGISTERED',
            details: JSON.stringify({ email: user.email, organizationName: organization.name }),
            ipAddress,
            correlationId,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    async login(data, ipAddress, correlationId) {
        const user = await userRepository_1.userRepository.findByEmail(data.email);
        if (!user) {
            throw new errorMiddleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await bcryptjs_1.default.compare(data.passwordHash, user.passwordHash);
        if (!isMatch) {
            throw new errorMiddleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        // Create Session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: refreshToken,
            expiresAt,
        });
        // Write Audit Log
        await auditLogRepository_1.auditLogRepository.create({
            user: { connect: { id: user.id } },
            organization: { connect: { id: user.organizationId } },
            action: 'USER_LOGGED_IN',
            details: JSON.stringify({ email: user.email }),
            ipAddress,
            correlationId,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    async refresh(refreshToken, ipAddress, correlationId) {
        const session = await sessionRepository_1.sessionRepository.findByToken(refreshToken);
        if (!session || session.revoked || session.expiresAt < new Date()) {
            throw new errorMiddleware_1.AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
        // Verify token validity
        try {
            jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new errorMiddleware_1.AppError('Invalid refresh token signature', 401, 'INVALID_REFRESH_TOKEN');
        }
        const user = session.user;
        const accessToken = this.generateAccessToken(user);
        // Write Audit Log for token renewal
        await auditLogRepository_1.auditLogRepository.create({
            user: { connect: { id: user.id } },
            organization: { connect: { id: user.organizationId } },
            action: 'TOKEN_REFRESHED',
            details: JSON.stringify({ sessionId: session.id }),
            ipAddress,
            correlationId,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
        };
    }
    async logout(refreshToken, ipAddress, correlationId) {
        const session = await sessionRepository_1.sessionRepository.findByToken(refreshToken);
        if (session) {
            await sessionRepository_1.sessionRepository.revoke(refreshToken);
            await auditLogRepository_1.auditLogRepository.create({
                user: { connect: { id: session.userId } },
                organization: { connect: { id: session.user.organizationId } },
                action: 'USER_LOGGED_OUT',
                details: JSON.stringify({ sessionId: session.id }),
                ipAddress,
                correlationId,
            });
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
