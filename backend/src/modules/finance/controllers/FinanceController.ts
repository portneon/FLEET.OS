import { Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export class FinanceController {
  
  public getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) {
        res.status(400).json({ error: 'Organization ID is required' });
        return;
      }

      // Fetch all transactions for the org
      const transactions = await prisma.transaction.findMany({
        where: { organizationId: orgId },
        orderBy: { date: 'desc' },
        take: 50 // recent 50
      });

      const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

      res.status(200).json({
        data: {
          revenue: income,
          expenses: expenses,
          profit: income - expenses,
          recentActivity: transactions
        },
        message: 'Finance summary fetched successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch finance summary' });
    }
  };

  public addTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) {
        res.status(400).json({ error: 'Organization ID is required' });
        return;
      }

      const { amount, type, category, description } = req.body;

      if (!amount || !type || !category) {
        res.status(400).json({ error: 'Amount, type, and category are required' });
        return;
      }

      const transaction = await prisma.transaction.create({
        data: {
          organizationId: orgId,
          amount: parseFloat(amount),
          type: type as TransactionType,
          category,
          description
        }
      });

      res.status(201).json({
        data: transaction,
        message: 'Transaction recorded successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add transaction' });
    }
  };
}
