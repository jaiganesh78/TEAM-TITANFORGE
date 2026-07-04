import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import { organizationRepository } from '../repositories/organizationRepository';
import { sessionRepository } from '../repositories/sessionRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { AppError } from '../middleware/errorMiddleware';
import { Role, User, Organization } from '@prisma/client';
import { prisma } from '../database/prisma';

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRY || '15m' } as any
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY || '7d' } as any
    );
  }

  async register(
    data: { name: string; email: string; passwordHash: string; organizationName: string },
    ipAddress?: string,
    correlationId?: string
  ): Promise<AuthResult> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email address is already in use', 409, 'EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(data.passwordHash, 10);
    const verificationToken = jwt.sign({ email: data.email }, env.JWT_SECRET, { expiresIn: '24h' });

    const organization = await organizationRepository.create({
      name: data.organizationName,
    });

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: Role.OWNER,
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
    await sessionRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });

    await auditLogRepository.create({
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

  async login(
    data: { email: string; passwordHash: string },
    ipAddress?: string,
    correlationId?: string
  ): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });

    await auditLogRepository.create({
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
  async loginWithGoogle(
    googleToken: string,
    ipAddress?: string,
    correlationId?: string
  ): Promise<AuthResult> {
    // Decode googleToken to get profile (in real app, use google-auth-library)
    let email = 'mock-google-user@titanforge-enterprise.com';
    let name = 'Google User';

    if (googleToken && googleToken !== 'mock_token') {
      try {
        const decoded: any = jwt.decode(googleToken);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || decoded.email.split('@')[0];
        }
      } catch {
        console.warn('[AuthService] Could not parse Google OAuth JWT, using mock.');
      }
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto register OAuth user with a default Org
      const organization = await organizationRepository.create({
        name: `${name}'s Org`,
      });

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          role: Role.OWNER,
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
    await sessionRepository.create({
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
  async verifyEmail(token: string): Promise<void> {
    try {
      jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError('Invalid or expired verification link.', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      throw new AppError('Verification link is invalid or already verified.', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    await prisma.user.update({
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
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Silent error or generic OK to prevent enumeration
      return;
    }

    const resetToken = jwt.sign({ email: user.email }, env.JWT_SECRET, { expiresIn: '1h' });
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await prisma.user.update({
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
  async resetPassword(token: string, newPasswordHash: string): Promise<void> {
    try {
      jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError('Reset link is invalid or expired.', 400, 'INVALID_RESET_TOKEN');
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new AppError('Reset link is invalid or expired.', 400, 'INVALID_RESET_TOKEN');
    }

    const newHash = await bcrypt.hash(newPasswordHash, 10);

    await prisma.user.update({
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
  async refresh(
    refreshToken: string,
    ipAddress?: string,
    correlationId?: string
  ): Promise<AuthResult> {
    const session = await sessionRepository.findByToken(refreshToken);
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid refresh token signature', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = session.user;

    // RTR: Revoke old session token
    await sessionRepository.revoke(refreshToken);

    // Generate new token pair
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // Save new session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionRepository.create({
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

  async logout(refreshToken: string, ipAddress?: string, correlationId?: string): Promise<void> {
    const session = await sessionRepository.findByToken(refreshToken);
    if (session) {
      await sessionRepository.revoke(refreshToken);

      await auditLogRepository.create({
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

export const authService = new AuthService();

