import { Transaction, TransactionType } from '@prisma/client';
import { prisma } from '../../../prisma';
import { IFinanceRepository, CreateTransactionDTO } from '../interfaces/IFinanceRepository';

export class PrismaFinanceRepository implements IFinanceRepository {
    async create(data: CreateTransactionDTO): Promise<Transaction> {
        return await prisma.transaction.create({
            data: {
                organizationId: data.organizationId,
                amount: data.amount,
                type: data.type,
                category: data.category,
                description: data.description
            }
        });
    }

    async findByOrganization(organizationId: string, limit: number = 50): Promise<Transaction[]> {
        return await prisma.transaction.findMany({
            where: { organizationId },
            orderBy: { date: 'desc' },
            take: limit
        });
    }
}