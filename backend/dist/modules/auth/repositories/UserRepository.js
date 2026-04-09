"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
class UserRepository {
    prisma = new client_1.PrismaClient();
    async findAllByOrg(organizationId) {
        return await this.prisma.user.findMany({
            where: { organizationId },
            include: {
                driverProfile: true
            }
        });
    }
    async createUser(data) {
        return await this.prisma.user.create({ data });
    }
    async findByEmail(email) {
        return await this.prisma.user.findUnique({ where: { email } });
    }
}
exports.UserRepository = UserRepository;
