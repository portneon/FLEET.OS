"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../../../prisma");
class UserRepository {
    async findByEmail(email) {
        return await prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async create(userData) {
        return await prisma_1.prisma.user.create({
            data: userData,
        });
    }
    async findAllByOrg(orgId) {
        return await prisma_1.prisma.user.findMany({
            where: {
                organizationId: orgId
            },
            include: {
                driverProfile: true
            }
        });
    }
}
exports.UserRepository = UserRepository;
