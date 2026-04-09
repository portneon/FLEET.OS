"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const prisma_1 = require("../prisma");
class StaffService {
    async registerStaff(staffData) {
        const staff = await prisma_1.prisma.staff.create({
            data: staffData,
            include: { role: true }
        });
        return staff;
    }
    async findAllStaff() {
        return prisma_1.prisma.staff.findMany({
            include: { role: true }
        });
    }
    async loginStaff(email, password) {
        const staff = await prisma_1.prisma.staff.findUnique({
            where: { email }
        });
        if (staff && staff.password === password) {
            return staff;
        }
        return null;
    }
}
exports.StaffService = StaffService;
