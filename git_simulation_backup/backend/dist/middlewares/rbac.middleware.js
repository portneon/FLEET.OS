"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../prisma");
const requireAdmin = async (req, res, next) => {
    try {
        const adminEmail = req.headers['x-admin-email'];
        if (!adminEmail) {
            res.status(401).json({ error: 'Unauthorized: No Admin Email provided in headers' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: adminEmail }
        });
        if (!user || user.role !== client_1.Role.ADMIN) {
            res.status(403).json({ error: 'Forbidden: Requires Admin privileges' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error in RBAC middleware' });
    }
};
exports.requireAdmin = requireAdmin;
