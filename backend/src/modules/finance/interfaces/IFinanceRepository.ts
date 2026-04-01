import { Transaction, TransactionType } from '@prisma/client';

export interface CreateTransactionDTO {
    organizationId: string;
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
}

export interface IFinanceRepository {
    create(data: CreateTransactionDTO): Promise<Transaction>;
    findByOrganization(organizationId: string, limit?: number): Promise<Transaction[]>;
}