"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDriverRepository = void 0;
const client_1 = require("@prisma/client");
class PrismaDriverRepository {
    prisma = new client_1.PrismaClient();
    async createProfile(data) {
        return await this.prisma.driver_profile.create({
            data: {
                userId: data.userId,
                licenseNumber: data.licenseNumber,
                experience: data.experience
            }
        });
    }
    async findByUserId(userId) {
        return await this.prisma.driver_profile.findUnique({ where: { userId } });
    }
}
exports.PrismaDriverRepository = PrismaDriverRepository;
