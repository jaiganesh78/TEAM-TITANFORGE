"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const prisma_1 = require("../database/prisma");
class UserRepository {
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { organization: true }
        });
    }
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async create(data) {
        return prisma_1.prisma.user.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.user.delete({
            where: { id },
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
