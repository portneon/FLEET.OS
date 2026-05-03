import { Transaction, TransactionType, Customer, Invoice, Payment, Expense, FuelLog, MaintenanceLog, Payroll, Receivable, Payable } from '@prisma/client';
import {
    IFinanceRepository,
    CreateCustomerDTO, UpdateCustomerDTO,
    CreateInvoiceDTO, UpdateInvoiceDTO,
    CreatePaymentDTO,
    CreateExpenseDTO, UpdateExpenseDTO,
    CreateFuelLogDTO,
    CreateMaintenanceLogDTO,
    CreatePayrollDTO, UpdatePayrollDTO,
    UpdateReceivableDTO,
    CreatePayableDTO, UpdatePayableDTO
} from '../interfaces/IFinanceRepository';
import { IFinanceService, FinanceSummary, FinanceDashboard } from '../interfaces/IFinanceService';

export class FinanceService implements IFinanceService {
    constructor(private financeRepo: IFinanceRepository) {}

    // ─── Legacy Summary (Transaction-based) ─────────

    async getSummary(organizationId: string, filters?: { category?: string; type?: string }): Promise<FinanceSummary> {
        const transactions = await this.financeRepo.findByOrganization(organizationId, filters);

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

    async updateTransaction(id: string, data: { amount?: number; category?: string; description?: string }): Promise<Transaction> {
        return await this.financeRepo.updateTransaction(id, data);
    }

    async deleteTransaction(id: string): Promise<void> {
        return await this.financeRepo.deleteTransaction(id);
    }

    // ─── Dashboard (real data) ──────────────────────

    async getDashboard(organizationId: string): Promise<FinanceDashboard> {
        const [invoices, expenses, receivables, payables] = await Promise.all([
            this.financeRepo.findInvoicesByOrg(organizationId),
            this.financeRepo.findExpensesByOrg(organizationId),
            this.financeRepo.findReceivablesByOrg(organizationId),
            this.financeRepo.findPayablesByOrg(organizationId)
        ]);

        const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = invoices
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + inv.total, 0);
        const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length;

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const fuelExpenses = expenses
            .filter(exp => exp.category === 'FUEL')
            .reduce((sum, exp) => sum + exp.amount, 0);

        const maintenanceExpenses = expenses
            .filter(exp => exp.category === 'MAINTENANCE')
            .reduce((sum, exp) => sum + exp.amount, 0);

        const salaryExpenses = expenses
            .filter(exp => exp.category === 'SALARY')
            .reduce((sum, exp) => sum + exp.amount, 0);

        const pendingReceivables = receivables
            .filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')
            .reduce((sum, r) => sum + r.amountDue, 0);

        const pendingPayables = payables
            .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            totalInvoiced,
            totalPaid,
            totalExpenses,
            totalFuelCost: fuelExpenses,
            totalMaintenanceCost: maintenanceExpenses,
            totalPayroll: salaryExpenses,
            netProfit: totalPaid - totalExpenses,
            pendingReceivables,
            pendingPayables,
            overdueInvoices
        };
    }

    // ─── Customer ───────────────────────────────────

    async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
        if (!data.name || !data.organizationId) {
            throw new Error('Customer name and organization are required.');
        }
        return await this.financeRepo.createCustomer(data);
    }

    async getCustomers(organizationId: string): Promise<Customer[]> {
        return await this.financeRepo.findCustomersByOrg(organizationId);
    }

    async getCustomerById(id: string): Promise<Customer> {
        const customer = await this.financeRepo.findCustomerById(id);
        if (!customer) throw new Error('Customer not found.');
        return customer;
    }

    async updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer> {
        await this.getCustomerById(id); // Verify exists
        return await this.financeRepo.updateCustomer(id, data);
    }

    async deleteCustomer(id: string): Promise<void> {
        await this.getCustomerById(id); // Verify exists
        await this.financeRepo.deleteCustomer(id);
    }

    // ─── Invoice ────────────────────────────────────

    async createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
        if (!data.customerId || !data.organizationId || !data.dueDate) {
            throw new Error('Customer, organization, and due date are required.');
        }

        // Auto-calculate total if not provided
        const discount = data.discount || 0;
        const total = data.total || (data.subtotal + data.tax - discount);
        const invoiceData = { ...data, discount, total };

        const invoice = await this.financeRepo.createInvoice(invoiceData);

        // Auto-create matching Receivable
        await this.financeRepo.createReceivable({
            organizationId: data.organizationId,
            invoiceId: invoice.id,
            amountDue: total,
            dueDate: new Date(data.dueDate),
            status: 'PENDING'
        });

        return invoice;
    }

    async getInvoices(organizationId: string, filters?: { status?: string; customerId?: string }): Promise<Invoice[]> {
        return await this.financeRepo.findInvoicesByOrg(organizationId, filters);
    }

    async getInvoiceById(id: string): Promise<Invoice> {
        const invoice = await this.financeRepo.findInvoiceById(id);
        if (!invoice) throw new Error('Invoice not found.');
        return invoice;
    }

    async updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<Invoice> {
        await this.getInvoiceById(id); // Verify exists
        return await this.financeRepo.updateInvoice(id, data);
    }

    async deleteInvoice(id: string): Promise<void> {
        await this.getInvoiceById(id); // Verify exists
        await this.financeRepo.deleteInvoice(id);
    }

    // ─── Payment ────────────────────────────────────

    async recordPayment(data: CreatePaymentDTO): Promise<Payment> {
        if (!data.invoiceId || !data.amount || !data.method) {
            throw new Error('Invoice ID, amount, and payment method are required.');
        }

        const payment = await this.financeRepo.createPayment(data);

        // If payment is successful, check if invoice should be marked PAID
        if (data.status === 'SUCCESS') {
            const invoice = await this.financeRepo.findInvoiceById(data.invoiceId);
            if (invoice) {
                // Get all successful payments for this invoice
                const allPayments = (invoice as any).payments || [];
                const totalPaid = allPayments
                    .filter((p: any) => p.status === 'SUCCESS')
                    .reduce((sum: number, p: any) => sum + p.amount, 0) + data.amount;

                if (totalPaid >= invoice.total) {
                    await this.financeRepo.updateInvoice(data.invoiceId, {
                        status: 'PAID',
                        paidAt: new Date()
                    });

                    // Update matching receivable
                    const receivables = await this.financeRepo.findReceivablesByOrg(invoice.organizationId, {});
                    const matchingReceivable = receivables.find(r => r.invoiceId === data.invoiceId);
                    if (matchingReceivable) {
                        await this.financeRepo.updateReceivable(matchingReceivable.id, {
                            status: 'PAID',
                            amountDue: 0
                        });
                    }
                }
            }
        }

        return payment;
    }

    async getPayments(organizationId: string): Promise<Payment[]> {
        return await this.financeRepo.findPaymentsByOrg(organizationId);
    }

    // ─── Expense ────────────────────────────────────

    async createExpense(data: CreateExpenseDTO): Promise<Expense> {
        if (!data.organizationId || !data.category || !data.amount) {
            throw new Error('Organization, category, and amount are required.');
        }
        return await this.financeRepo.createExpense(data);
    }

    async getExpenses(organizationId: string, filters?: { category?: string; vehicleId?: string; driverId?: string; tripId?: string }): Promise<Expense[]> {
        return await this.financeRepo.findExpensesByOrg(organizationId, filters);
    }

    async getExpenseById(id: string): Promise<Expense> {
        const expense = await this.financeRepo.findExpenseById(id);
        if (!expense) throw new Error('Expense not found.');
        return expense;
    }

    async updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense> {
        await this.getExpenseById(id);
        return await this.financeRepo.updateExpense(id, data);
    }

    async deleteExpense(id: string): Promise<void> {
        await this.getExpenseById(id);
        await this.financeRepo.deleteExpense(id);
    }

    // ─── FuelLog ────────────────────────────────────

    async createFuelLog(data: CreateFuelLogDTO): Promise<FuelLog> {
        if (!data.vehicleId || !data.liters || !data.cost || !data.odometer) {
            throw new Error('Vehicle ID, liters, cost, and odometer reading are required.');
        }
        return await this.financeRepo.createFuelLog(data);
    }

    async getFuelLogs(organizationId: string, filters?: { vehicleId?: string; tripId?: string }): Promise<FuelLog[]> {
        return await this.financeRepo.findFuelLogsByOrg(organizationId, filters);
    }

    async getFuelLogById(id: string): Promise<FuelLog> {
        const log = await this.financeRepo.findFuelLogById(id);
        if (!log) throw new Error('Fuel log not found.');
        return log;
    }

    // ─── MaintenanceLog ─────────────────────────────

    async createMaintenanceLog(data: CreateMaintenanceLogDTO): Promise<MaintenanceLog> {
        if (!data.vehicleId || !data.maintenanceType || !data.cost) {
            throw new Error('Vehicle ID, maintenance type, and cost are required.');
        }
        return await this.financeRepo.createMaintenanceLog(data);
    }

    async getMaintenanceLogs(vehicleId: string): Promise<MaintenanceLog[]> {
        return await this.financeRepo.findMaintenanceLogsByVehicle(vehicleId);
    }

    async getMaintenanceLogById(id: string): Promise<MaintenanceLog> {
        const log = await this.financeRepo.findMaintenanceLogById(id);
        if (!log) throw new Error('Maintenance log not found.');
        return log;
    }

    // ─── Payroll ────────────────────────────────────

    async createPayroll(data: CreatePayrollDTO): Promise<Payroll> {
        if (!data.driverId || !data.month || !data.baseSalary) {
            throw new Error('Driver ID, month, and base salary are required.');
        }

        // Auto-calculate netPay if not provided
        const bonus = data.bonus || 0;
        const deductions = data.deductions || 0;
        const netPay = data.netPay || (data.baseSalary + bonus - deductions);

        return await this.financeRepo.createPayroll({
            ...data,
            bonus,
            deductions,
            netPay
        });
    }

    async getPayrolls(organizationId: string, filters?: { driverId?: string; month?: string }): Promise<Payroll[]> {
        return await this.financeRepo.findPayrollsByOrg(organizationId, filters);
    }

    async getPayrollById(id: string): Promise<Payroll> {
        const payroll = await this.financeRepo.findPayrollById(id);
        if (!payroll) throw new Error('Payroll record not found.');
        return payroll;
    }

    async updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll> {
        await this.getPayrollById(id);
        return await this.financeRepo.updatePayroll(id, data);
    }

    // ─── Receivable ─────────────────────────────────

    async getReceivables(organizationId: string, filters?: { status?: string }): Promise<Receivable[]> {
        return await this.financeRepo.findReceivablesByOrg(organizationId, filters);
    }

    async updateReceivable(id: string, data: UpdateReceivableDTO): Promise<Receivable> {
        return await this.financeRepo.updateReceivable(id, data);
    }

    // ─── Payable ────────────────────────────────────

    async createPayable(data: CreatePayableDTO): Promise<Payable> {
        if (!data.organizationId || !data.vendor || !data.amount || !data.dueDate) {
            throw new Error('Organization, vendor, amount, and due date are required.');
        }
        return await this.financeRepo.createPayable(data);
    }

    async getPayables(organizationId: string, filters?: { status?: string }): Promise<Payable[]> {
        return await this.financeRepo.findPayablesByOrg(organizationId, filters);
    }

    async updatePayable(id: string, data: UpdatePayableDTO): Promise<Payable> {
        return await this.financeRepo.updatePayable(id, data);
    }
}