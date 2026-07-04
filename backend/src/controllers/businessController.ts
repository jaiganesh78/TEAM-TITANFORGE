import { Request, Response, NextFunction } from 'express';
import { businessService } from '../services/businessService';
import { businessRepository } from '../repositories/businessRepository';
import { AppError } from '../middleware/errorMiddleware';

export class BusinessController {
  // POST /api/business
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }
      const { name } = req.body;
      const business = await businessService.createInvestigation(req.user.organizationId, name);

      res.status(201).json({
        success: true,
        data: business,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }
      const list = await businessService.listInvestigations(req.user.organizationId);
      res.status(200).json({
        success: true,
        data: list,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business/:id
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const summary = await businessService.getTwinSummary(id);
      
      // Verify tenancy access
      if (req.user && summary.business.organizationId !== req.user.organizationId) {
        throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
      }

      res.status(200).json({
        success: true,
        data: summary,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/business/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const summary = await businessService.getBasicBusiness(id);
      if (!summary) {
        throw new AppError('Digital Twin not found', 404, 'NOT_FOUND');
      }

      // Verify tenancy
      if (req.user && summary.organizationId !== req.user.organizationId) {
        throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
      }

      const deleted = await businessService.deleteInvestigation(id);
      res.status(200).json({
        success: true,
        data: { id: deleted.id, deleted: true },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business/:id/section/:section
  async getSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, section } = req.params;
      const basic = await businessService.getBasicBusiness(id);
      if (!basic) {
        throw new AppError('Digital Twin not found', 404, 'NOT_FOUND');
      }

      if (req.user && basic.organizationId !== req.user.organizationId) {
        throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
      }

      const sectionData = await businessService.getSectionData(id, section);
      res.status(200).json({
        success: true,
        data: sectionData,
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/business/:id/section/:section
  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, section } = req.params;
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const basic = await businessService.getBasicBusiness(id);
      if (!basic) {
        throw new AppError('Digital Twin not found', 404, 'NOT_FOUND');
      }

      if (basic.organizationId !== req.user.organizationId) {
        throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
      }

      const updatedData = await businessService.updateSectionData(id, req.user.userId, section, req.body);
      const progress = await businessRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          section: section,
          content: updatedData,
          progress: progress.discoveryProgress,
          lastUpdated: progress.lastUpdated,
        },
        correlationId: req.correlationId,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business/:id/audit-history
  async getAuditHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const basic = await businessService.getBasicBusiness(id);
      if (!basic) {
        throw new AppError('Digital Twin not found', 404, 'NOT_FOUND');
      }

      if (req.user && basic.organizationId !== req.user.organizationId) {
        throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
      }

      const logs = await businessRepository.findAuditLogs(id);
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
export const businessController = new BusinessController();
