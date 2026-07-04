import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidators';
import { AppError } from '../middleware/errorMiddleware';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body);
      const result = await authService.register(
        {
          name: body.name,
          email: body.email,
          passwordHash: body.password,
          organizationName: body.organizationName,
        },
        req.ip,
        req.correlationId
      );

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(
        {
          email: body.email,
          passwordHash: body.password,
        },
        req.ip,
        req.correlationId
      );

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
      }

      const result = await authService.refresh(refreshToken, req.ip, req.correlationId);
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken, req.ip, req.correlationId);
      }
      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
