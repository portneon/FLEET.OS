"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const client_1 = require("@prisma/client");
class FinanceService {
    financeRepo;
    constructor(financeRepo) {
        this.financeRepo = financeRepo;
    }
    async getSummary(organizationId) {
        const transactions = await this.financeRepo.findByOrganization(organizationId);
        const income = transactions
            .filter(t => t.type === client_1.TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === client_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            revenue: income,
            expenses: expenses,
            profit: income - expenses,
            recentActivity: transactions
        };
    }
    async addTransaction(data) {
        return await this.financeRepo.create({
            organizationId: data.organizationId,
            amount: data.amount,
            type: data.type,
            category: data.category,
            description: data.description
        });
    }
}
exports.FinanceService = FinanceService;
