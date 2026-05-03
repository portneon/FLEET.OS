// src/modules/finance/finance.routes.ts

import { Router } from 'express';
import { FinanceController } from './controllers/FinanceController';
import { Routes } from '../../shared/interfaces/routes.interface';
import { authenticate } from '../auth/middlewares/auth.middleware';

export class FinanceRoute implements Routes {
    public path = '/finance';
    public router = Router();

    constructor(public financeController: FinanceController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // ── Legacy (kept) ───────────────────────────
        this.router.get('/summary', authenticate, this.financeController.getSummary);
        this.router.post('/record', authenticate, this.financeController.addTransaction);
        this.router.put('/transactions/:id', authenticate, this.financeController.updateTransaction);
        this.router.delete('/transactions/:id', authenticate, this.financeController.deleteTransaction);

        // ── Dashboard ───────────────────────────────
        this.router.get('/dashboard', authenticate, this.financeController.getDashboard);

        // ── Customers ───────────────────────────────
        this.router.post('/customers', authenticate, this.financeController.createCustomer);
        this.router.get('/customers', authenticate, this.financeController.getCustomers);
        this.router.get('/customers/:id', authenticate, this.financeController.getCustomerById);
        this.router.put('/customers/:id', authenticate, this.financeController.updateCustomer);
        this.router.delete('/customers/:id', authenticate, this.financeController.deleteCustomer);

        // ── Invoices ────────────────────────────────
        this.router.post('/invoices', authenticate, this.financeController.createInvoice);
        this.router.get('/invoices', authenticate, this.financeController.getInvoices);
        this.router.get('/invoices/:id', authenticate, this.financeController.getInvoiceById);
        this.router.put('/invoices/:id', authenticate, this.financeController.updateInvoice);
        this.router.delete('/invoices/:id', authenticate, this.financeController.deleteInvoice);

        // ── Payments ────────────────────────────────
        this.router.post('/payments', authenticate, this.financeController.recordPayment);
        this.router.get('/payments', authenticate, this.financeController.getPayments);

        // ── Expenses ────────────────────────────────
        this.router.post('/expenses', authenticate, this.financeController.createExpense);
        this.router.get('/expenses', authenticate, this.financeController.getExpenses);
        this.router.get('/expenses/:id', authenticate, this.financeController.getExpenseById);
        this.router.put('/expenses/:id', authenticate, this.financeController.updateExpense);
        this.router.delete('/expenses/:id', authenticate, this.financeController.deleteExpense);

        // ── Fuel Logs ───────────────────────────────
        this.router.post('/fuel-logs', authenticate, this.financeController.createFuelLog);
        this.router.get('/fuel-logs', authenticate, this.financeController.getFuelLogs);
        this.router.get('/fuel-logs/:id', authenticate, this.financeController.getFuelLogById);

        // ── Maintenance Logs ────────────────────────
        this.router.post('/maintenance', authenticate, this.financeController.createMaintenanceLog);
        this.router.get('/maintenance', authenticate, this.financeController.getMaintenanceLogs);
        this.router.get('/maintenance/:id', authenticate, this.financeController.getMaintenanceLogById);

        // ── Payroll ─────────────────────────────────
        this.router.post('/payroll', authenticate, this.financeController.createPayroll);
        this.router.get('/payroll', authenticate, this.financeController.getPayrolls);
        this.router.get('/payroll/:id', authenticate, this.financeController.getPayrollById);
        this.router.put('/payroll/:id', authenticate, this.financeController.updatePayroll);

        // ── Receivables ─────────────────────────────
        this.router.get('/receivables', authenticate, this.financeController.getReceivables);
        this.router.put('/receivables/:id', authenticate, this.financeController.updateReceivable);

        // ── Payables ────────────────────────────────
        this.router.post('/payables', authenticate, this.financeController.createPayable);
        this.router.get('/payables', authenticate, this.financeController.getPayables);
        this.router.put('/payables/:id', authenticate, this.financeController.updatePayable);
    }
}
