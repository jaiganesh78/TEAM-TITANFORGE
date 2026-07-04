import { prisma } from '../database/prisma';
import { AuditLog, Prisma } from '@prisma/client';

export class AuditLogRepository {
  async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }

  async findByOrganization(organizationId: string, limit: number = 50): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
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

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
export const auditLogRepository = new AuditLogRepository();
