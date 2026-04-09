"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("prisma");
class AuthService {
    async findAllUser() {
        const users = await prisma_1.prisma.user.findMany();
        return users;
    }
    async createUser(userData) {
        const user = await prisma_1.prisma.user.create({ data: userData });
        return user;
    }
    async findUserByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        return user;
    }
}
exports.AuthService = AuthService;
