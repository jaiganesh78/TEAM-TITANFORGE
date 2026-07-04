"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = exports.OrganizationController = void 0;
const organizationRepository_1 = require("../repositories/organizationRepository");
const auditLogRepository_1 = require("../repositories/auditLogRepository");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
class OrganizationController {
    async getDetails(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const org = await organizationRepository_1.organizationRepository.findById(req.user.organizationId);
            if (!org) {
                throw new errorMiddleware_1.AppError('Organization not found', 404, 'NOT_FOUND');
            }
            res.status(200).json({
                success: true,
                data: org,
                correlationId: req.correlationId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateDetails(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const { name } = req.body;
            if (!name || typeof name !== 'string' || name.trim().length < 2) {
                throw new errorMiddleware_1.AppError('Name is required and must be at least 2 characters long', 400, 'VALIDATION_ERROR');
            }
            const updatedOrg = await organizationRepository_1.organizationRepository.update(req.user.organizationId, {
                name: name.trim(),
            });
            // Write audit log
            await auditLogRepository_1.auditLogRepository.create({
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
        }
        catch (error) {
            next(error);
        }
    }
    async getAuditLogs(req, res, next) {
        try {
            if (!req.user) {
                throw new errorMiddleware_1.AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            const logs = await auditLogRepository_1.auditLogRepository.findByOrganization(req.user.organizationId);
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
exports.OrganizationController = OrganizationController;
exports.organizationController = new OrganizationController();
