import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import { organizationRepository } from '../repositories/organizationRepository';
import { sessionRepository } from '../repositories/sessionRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { AppError } from '../middleware/errorMiddleware';
import { Role, User, Organization } from '@prisma/client';

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
      { expiresIn: env.ACCESS_TOKEN_EXPIRY } as any
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY } as any
    );
  }

  async register(
    data: { name: string; email: string; passwordHash: string; organizationName: string },
    ipAddress?: string,
    correlationId?: string
  ): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email address is already in use', 409, 'EMAIL_IN_USE');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);

    // Create Organization and User within a transaction (implied or direct, since we have single repository calls we will run sequentially or let Prisma handle)
    const organization = await organizationRepository.create({
      name: data.organizationName,
    });

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.OWNER, // The creator of the organization is always OWNER
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
    await sessionRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });

    // Write Audit Log
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
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create Session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });

    // Write Audit Log
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

  async refresh(refreshToken: string, ipAddress?: string, correlationId?: string): Promise<Omit<AuthResult, 'refreshToken'>> {
    const session = await sessionRepository.findByToken(refreshToken);
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Verify token validity
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid refresh token signature', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = session.user;
    const accessToken = this.generateAccessToken(user);

    // Write Audit Log for token renewal
    await auditLogRepository.create({
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
