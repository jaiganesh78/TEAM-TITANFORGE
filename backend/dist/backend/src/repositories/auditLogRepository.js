"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogRepository = exports.AuditLogRepository = void 0;
const prisma_1 = require("../database/prisma");
class AuditLogRepository {
    async create(data) {
        return prisma_1.prisma.auditLog.create({ data });
    }
    async findByOrganization(organizationId, limit = 50) {
        return prisma_1.prisma.auditLog.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });
    }
    async findByUser(userId, limit = 50) {
        return prisma_1.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
exports.AuditLogRepository = AuditLogRepository;
exports.auditLogRepository = new AuditLogRepository();
