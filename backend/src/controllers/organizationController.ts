import { Request, Response, NextFunction } from 'express';
import { organizationRepository } from '../repositories/organizationRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { AppError } from '../middleware/errorMiddleware';
import { Role } from '@prisma/client';

export class OrganizationController {
  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const org = await organizationRepository.findById(req.user.organizationId);
      if (!org) {
        throw new AppError('Organization not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: org,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDetails(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new AppError('Name is required and must be at least 2 characters long', 400, 'VALIDATION_ERROR');
      }

      const updatedOrg = await organizationRepository.update(req.user.organizationId, {
        name: name.trim(),
      });

      // Write audit log
      await auditLogRepository.create({
        user: { connect: { id: req.user.userId } },
        organization: { connect: { id: req.user.organizationId } },
        action: 'ORGANIZATION_UPDATED',
        details: JSON.stringify({ oldName: name, newName: updatedOrg.name }),
        ipAddress: req.ip,
        correlationId: req.correlationId,
      });

      res.status(200).json({
        success: true,
        data: updatedOrg,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const logs = await auditLogRepository.findByOrganization(req.user.organizationId);
      res.status(200).json({
        success: true,
        data: logs,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
