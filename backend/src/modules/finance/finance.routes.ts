// src/modules/finance/finance.routes.ts

import { Router } from 'express';
import { FinanceController } from './controllers/FinanceController';
import { Routes } from '../../shared/interfaces/routes.interface';

export class FinanceRoute implements Routes {
    public path = '/finance';
    public router = Router();

    constructor(public financeController: FinanceController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/summary', this.financeController.getSummary);
        this.router.post('/record', this.financeController.addTransaction);
    }
}
