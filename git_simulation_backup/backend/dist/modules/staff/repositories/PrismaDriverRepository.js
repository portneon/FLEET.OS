"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDriverRepository = void 0;
const prisma_1 = require("../../../prisma");
class PrismaDriverRepository {
    async createProfile(data) {
        return await prisma_1.prisma.driverProfile.create({
            data: {
                userId: data.userId,
                licenseNumber: data.licenseNumber,
                experience: data.experience
            }
        });
    }
    async findByUserId(userId) {
        return await prisma_1.prisma.driverProfile.findUnique({ where: { userId } });
    }
}
exports.PrismaDriverRepository = PrismaDriverRepository;
