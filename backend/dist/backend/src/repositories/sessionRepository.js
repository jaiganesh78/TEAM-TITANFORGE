"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
const prisma_1 = require("../database/prisma");
class SessionRepository {
    async findByToken(token) {
        return prisma_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
    }
    async create(data) {
        return prisma_1.prisma.session.create({ data });
    }
    async revoke(token) {
        return prisma_1.prisma.session.update({
            where: { token },
            data: { revoked: true },
        });
    }
    async revokeAllForUser(userId) {
        return prisma_1.prisma.session.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
    }
    async deleteExpired() {
        return prisma_1.prisma.session.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revoked: true }
                ]
            }
        });
    }
}
exports.SessionRepository = SessionRepository;
exports.sessionRepository = new SessionRepository();
