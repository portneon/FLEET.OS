import { Request, Response } from 'express';
import { IFinanceService } from '../interfaces/IFinanceService';

export class FinanceController {
    constructor(private financeService: IFinanceService) {}

    public getSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }

            const summary = await this.financeService.getSummary(orgId);

            res.status(200).json({
                data: summary,
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

            const transaction = await this.financeService.addTransaction({
                organizationId: orgId,
                amount: parseFloat(amount),
                type,
                category,
                description
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
