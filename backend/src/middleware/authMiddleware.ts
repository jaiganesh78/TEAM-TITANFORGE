import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorMiddleware';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

import { prisma } from '../database/prisma';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Zero-Auth Mode: Automatically inject the default seeded executive account context
  prisma.user.findFirst({
    where: { email: 'executive@rajalakshmi.edu.in' }
  }).then((defaultUser) => {
    if (!defaultUser) {
      // Fallback: use first user found
      return prisma.user.findFirst().then((fallbackUser) => {
        if (fallbackUser) {
          req.user = {
            userId: fallbackUser.id,
            email: fallbackUser.email,
            role: fallbackUser.role,
            organizationId: fallbackUser.organizationId,
          };
        }
        next();
      }).catch(next);
    }
    
    req.user = {
      userId: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role,
      organizationId: defaultUser.organizationId,
    };
    next();
  }).catch(next);
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Zero-Auth Mode: allow all operations for all representatives
    next();
  };
}
