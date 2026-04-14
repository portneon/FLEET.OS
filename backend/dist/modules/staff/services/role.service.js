"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const client_1 = require("@prisma/client");
class RoleService {
    async findOrCreateRole(name) {
        // Since Role is an enum, we just validate it exists
        const roleValue = name.toUpperCase();
        if (Object.values(client_1.Role).includes(roleValue)) {
            return roleValue;
        }
        throw new Error(`Invalid role name: ${name}`);
    }
    async findAllRoles() {
        return Object.values(client_1.Role);
    }
}
exports.RoleService = RoleService;
