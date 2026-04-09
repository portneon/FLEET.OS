"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const prisma_1 = require("../prisma");
class RoleService {
    async findOrCreateRole(name) {
        let role = await prisma_1.prisma.role.findUnique({
            where: { name }
        });
        if (!role) {
            role = await prisma_1.prisma.role.create({
                data: { name }
            });
        }
        return role;
    }
    async findAllRoles() {
        return prisma_1.prisma.role.findMany();
    }
}
exports.RoleService = RoleService;
