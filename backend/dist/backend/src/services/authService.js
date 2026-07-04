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
const prisma_1 = require("../database/prisma");
class AuthService {
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRY || '15m' });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
        }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRY || '7d' });
    }
    async register(data, ipAddress, correlationId) {
        const existingUser = await userRepository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new errorMiddleware_1.AppError('Email address is already in use', 409, 'EMAIL_IN_USE');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.passwordHash, 10);
        const verificationToken = jsonwebtoken_1.default.sign({ email: data.email }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
        const organization = await organizationRepository_1.organizationRepository.create({
            name: data.organizationName,
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: client_1.Role.OWNER,
                organizationId: organization.id,
                emailVerified: false,
                verificationToken,
            },
        });
        // Log the verification link
        console.log(`[AuthService] Email verification link for ${user.email}: http://localhost:3000/verify-email?token=${verificationToken}`);
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: refreshToken,
            expiresAt,
        });
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
        const user = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            throw new errorMiddleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await bcryptjs_1.default.compare(data.passwordHash, user.passwordHash);
        if (!isMatch) {
            throw new errorMiddleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: refreshToken,
            expiresAt,
        });
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
    /**
     * Google OAuth mock/exchange endpoint.
     */
    async loginWithGoogle(googleToken, ipAddress, correlationId) {
        // Decode googleToken to get profile (in real app, use google-auth-library)
        let email = 'mock-google-user@titanforge-enterprise.com';
        let name = 'Google User';
        if (googleToken && googleToken !== 'mock_token') {
            try {
                const decoded = jsonwebtoken_1.default.decode(googleToken);
                if (decoded && decoded.email) {
                    email = decoded.email;
                    name = decoded.name || decoded.email.split('@')[0];
                }
            }
            catch {
                console.warn('[AuthService] Could not parse Google OAuth JWT, using mock.');
            }
        }
        let user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Auto register OAuth user with a default Org
            const organization = await organizationRepository_1.organizationRepository.create({
                name: `${name}'s Org`,
            });
            user = await prisma_1.prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: await bcryptjs_1.default.hash(Math.random().toString(36), 10),
                    role: client_1.Role.OWNER,
                    organizationId: organization.id,
                    emailVerified: true,
                    onboardingCompleted: false,
                },
            });
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: refreshToken,
            expiresAt,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    /**
     * Email Verification flow handler.
     */
    async verifyEmail(token) {
        try {
            jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        }
        catch {
            throw new errorMiddleware_1.AppError('Invalid or expired verification link.', 400, 'INVALID_VERIFICATION_TOKEN');
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: { verificationToken: token }
        });
        if (!user) {
            throw new errorMiddleware_1.AppError('Verification link is invalid or already verified.', 400, 'INVALID_VERIFICATION_TOKEN');
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null
            }
        });
    }
    /**
     * Forgot password token request.
     */
    async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Silent error or generic OK to prevent enumeration
            return;
        }
        const resetToken = jsonwebtoken_1.default.sign({ email: user.email }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: expires
            }
        });
        console.log(`[AuthService] Password reset link for ${user.email}: http://localhost:3000/reset-password?token=${resetToken}`);
    }
    /**
     * Reset Password verify & execute.
     */
    async resetPassword(token, newPasswordHash) {
        try {
            jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        }
        catch {
            throw new errorMiddleware_1.AppError('Reset link is invalid or expired.', 400, 'INVALID_RESET_TOKEN');
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() }
            }
        });
        if (!user) {
            throw new errorMiddleware_1.AppError('Reset link is invalid or expired.', 400, 'INVALID_RESET_TOKEN');
        }
        const newHash = await bcryptjs_1.default.hash(newPasswordHash, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newHash,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });
    }
    /**
     * Refresh Token Rotation (RTR) logic.
     * Invalidates the old refresh token and issues a fresh new pair.
     */
    async refresh(refreshToken, ipAddress, correlationId) {
        const session = await sessionRepository_1.sessionRepository.findByToken(refreshToken);
        if (!session || session.revoked || session.expiresAt < new Date()) {
            throw new errorMiddleware_1.AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
        try {
            jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new errorMiddleware_1.AppError('Invalid refresh token signature', 401, 'INVALID_REFRESH_TOKEN');
        }
        const user = session.user;
        // RTR: Revoke old session token
        await sessionRepository_1.sessionRepository.revoke(refreshToken);
        // Generate new token pair
        const accessToken = this.generateAccessToken(user);
        const newRefreshToken = this.generateRefreshToken(user);
        // Save new session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await sessionRepository_1.sessionRepository.create({
            user: { connect: { id: user.id } },
            token: newRefreshToken,
            expiresAt,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken: newRefreshToken,
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
