import { Transaction, TransactionType } from '@prisma/client';
import { IFinanceRepository } from '../interfaces/IFinanceRepository';
import { IFinanceService, FinanceSummary } from '../interfaces/IFinanceService';

export class FinanceService implements IFinanceService {
    constructor(private financeRepo: IFinanceRepository) {}

    async getSummary(organizationId: string): Promise<FinanceSummary> {
        const transactions = await this.financeRepo.findByOrganization(organizationId);

        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            revenue: income,
            expenses: expenses,
            profit: income - expenses,
            recentActivity: transactions
        };
    }

    async addTransaction(data: {
        organizationId: string;
        amount: number;
        type: string;
        category: string;
        description?: string;
    }): Promise<Transaction> {
        return await this.financeRepo.create({
            organizationId: data.organizationId,
            amount: data.amount,
            type: data.type as TransactionType,
            category: data.category,
            description: data.description
        });
    }
}