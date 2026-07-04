"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessController = exports.BusinessController = void 0;
const businessService_1 = require("../services/businessService");
const businessRepository_1 = require("../repositories/businessRepository");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
class BusinessController {
    // POST /api/business
    async create(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const { name } = req.body;
            const business = await businessService_1.businessService.createInvestigation(req.user.organizationId, name);
            res.status(201).json({
                success: true,
                data: business,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/business
    async list(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const list = await businessService_1.businessService.listInvestigations(req.user.organizationId);
            res.status(200).json({
                success: true,
                data: list,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/business/:id
    async getSummary(req, res, next) {
        try {
            const { id } = req.params;
            const summary = await businessService_1.businessService.getTwinSummary(id);
            // Verify tenancy access
            if (req.user && summary.business.organizationId !== req.user.organizationId) {
                throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
            }
            res.status(200).json({
                success: true,
                data: summary,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/business/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const summary = await businessService_1.businessService.getBasicBusiness(id);
            if (!summary) {
                throw new errorMiddleware_1.AppError('Digital Twin not found', 404, 'NOT_FOUND');
            }
            // Verify tenancy
            if (req.user && summary.organizationId !== req.user.organizationId) {
                throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
            }
            const deleted = await businessService_1.businessService.deleteInvestigation(id);
            res.status(200).json({
                success: true,
                data: { id: deleted.id, deleted: true },
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/business/:id/section/:section
    async getSection(req, res, next) {
        try {
            const { id, section } = req.params;
            const basic = await businessService_1.businessService.getBasicBusiness(id);
            if (!basic) {
                throw new errorMiddleware_1.AppError('Digital Twin not found', 404, 'NOT_FOUND');
            }
            if (req.user && basic.organizationId !== req.user.organizationId) {
                throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
            }
            const sectionData = await businessService_1.businessService.getSectionData(id, section);
            res.status(200).json({
                success: true,
                data: sectionData,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/business/:id/section/:section
    async updateSection(req, res, next) {
        try {
            const { id, section } = req.params;
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const basic = await businessService_1.businessService.getBasicBusiness(id);
            if (!basic) {
                throw new errorMiddleware_1.AppError('Digital Twin not found', 404, 'NOT_FOUND');
            }
            if (basic.organizationId !== req.user.organizationId) {
                throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
            }
            const updatedData = await businessService_1.businessService.updateSectionData(id, req.user.userId, section, req.body);
            const progress = await businessRepository_1.businessRepository.findById(id);
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
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/business/:id/audit-history
    async getAuditHistory(req, res, next) {
        try {
            const { id } = req.params;
            const basic = await businessService_1.businessService.getBasicBusiness(id);
            if (!basic) {
                throw new errorMiddleware_1.AppError('Digital Twin not found', 404, 'NOT_FOUND');
            }
            if (req.user && basic.organizationId !== req.user.organizationId) {
                throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
            }
            const logs = await businessRepository_1.businessRepository.findAuditLogs(id);
            res.status(200).json({
                success: true,
                data: logs,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BusinessController = BusinessController;
exports.businessController = new BusinessController();
