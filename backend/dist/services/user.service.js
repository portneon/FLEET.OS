"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../prisma");
class UserService {
    async findAllUser() {
        const users = await prisma_1.prisma.user.findMany();
        return users;
    }
    async createUser(userData) {
        const user = await prisma_1.prisma.user.create({ data: userData });
        return user;
    }
}
exports.UserService = UserService;
