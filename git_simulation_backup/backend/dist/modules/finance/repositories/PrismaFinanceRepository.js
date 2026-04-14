"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaFinanceRepository = void 0;
const prisma_1 = require("../../../prisma");
class PrismaFinanceRepository {
    async create(data) {
        return await prisma_1.prisma.transaction.create({
            data: {
                organizationId: data.organizationId,
                amount: data.amount,
                type: data.type,
                category: data.category,
                description: data.description
            }
        });
    }
    async findByOrganization(organizationId, limit = 50) {
        return await prisma_1.prisma.transaction.findMany({
            where: { organizationId },
            orderBy: { date: 'desc' },
            take: limit
        });
    }
}
exports.PrismaFinanceRepository = PrismaFinanceRepository;
