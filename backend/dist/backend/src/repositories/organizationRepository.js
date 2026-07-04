"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const prisma_1 = require("../database/prisma");
class OrganizationRepository {
    async findById(id) {
        return prisma_1.prisma.organization.findUnique({
            where: { id },
            include: { users: true },
        });
    }
    async create(data) {
        return prisma_1.prisma.organization.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.organization.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.organization.delete({
            where: { id },
        });
    }
}
exports.OrganizationRepository = OrganizationRepository;
exports.organizationRepository = new OrganizationRepository();
