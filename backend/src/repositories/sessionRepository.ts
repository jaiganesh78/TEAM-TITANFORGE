import { prisma } from '../database/prisma';
import { Session, Prisma } from '@prisma/client';

export class SessionRepository {
  async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    return prisma.session.create({ data });
  }

  async revoke(token: string): Promise<Session> {
    return prisma.session.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllForUser(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.session.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async deleteExpired(): Promise<Prisma.BatchPayload> {
    return prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true }
        ]
      }
    });
  }
}
export const sessionRepository = new SessionRepository();
