import { Transaction } from '@prisma/client';

export interface FinanceSummary {
    revenue: number;
    expenses: number;
    profit: number;
    recentActivity: Transaction[];
}

export interface IFinanceService {
    getSummary(organizationId: string): Promise<FinanceSummary>;
    addTransaction(data: {
        organizationId: string;
        amount: number;
        type: string;
        category: string;
        description?: string;
    }): Promise<Transaction>;
}