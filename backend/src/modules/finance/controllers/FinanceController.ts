import { Request, Response } from 'express';
import { IFinanceService } from '../interfaces/IFinanceService';

export class FinanceController {
    constructor(private financeService: IFinanceService) {}



    public getSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = {
                category: req.query.category as string | undefined,
                type: req.query.type as string | undefined,
            };
            const summary = await this.financeService.getSummary(orgId, filters);
            res.status(200).json({ data: summary, message: 'Finance summary fetched successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch finance summary' });
        }
    };

    public updateTransaction = async (req: Request, res: Response): Promise<void> => {
        try {
            const { amount, category, description } = req.body;
            const data: any = {};
            if (amount !== undefined) data.amount = parseFloat(amount);
            if (category) data.category = category;
            if (description !== undefined) data.description = description;

            const tx = await this.financeService.updateTransaction(req.params.id, data);
            res.status(200).json({ data: tx, message: 'Transaction updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public deleteTransaction = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.financeService.deleteTransaction(req.params.id);
            res.status(200).json({ data: null, message: 'Transaction deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public addTransaction = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { amount, type, category, description } = req.body;
            if (!amount || !type || !category) {
                res.status(400).json({ error: 'Amount, type, and category are required' }); return;
            }

            const transaction = await this.financeService.addTransaction({
                organizationId: orgId,
                amount: parseFloat(amount),
                type, category, description
            });
            res.status(201).json({ data: transaction, message: 'Transaction recorded successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add transaction' });
        }
    };

    // ─── Dashboard ──────────────────────────────────

    public getDashboard = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const dashboard = await this.financeService.getDashboard(orgId);
            res.status(200).json({ data: dashboard, message: 'Finance dashboard fetched successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch finance dashboard' });
        }
    };

    // ─── Customer ───────────────────────────────────

    public createCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { name, email, phone, customerType } = req.body;
            if (!name || !customerType) {
                res.status(400).json({ error: 'Name and customer type are required' }); return;
            }

            const customer = await this.financeService.createCustomer({
                organizationId: orgId, name, email, phone, customerType
            });
            res.status(201).json({ data: customer, message: 'Customer created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getCustomers = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const customers = await this.financeService.getCustomers(orgId);
            res.status(200).json({ data: customers, message: 'Customers retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve customers' });
        }
    };

    public getCustomerById = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.financeService.getCustomerById(req.params.id);
            res.status(200).json({ data: customer, message: 'Customer retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public updateCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.financeService.updateCustomer(req.params.id, req.body);
            res.status(200).json({ data: customer, message: 'Customer updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public deleteCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.financeService.deleteCustomer(req.params.id);
            res.status(200).json({ data: null, message: 'Customer deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ─── Invoice ────────────────────────────────────

    public createInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { customerId, tripId, subtotal, tax, discount, total, dueDate } = req.body;
            if (!customerId || subtotal === undefined || tax === undefined || !dueDate) {
                res.status(400).json({ error: 'Customer ID, subtotal, tax, and due date are required' }); return;
            }

            const calc = (total ? parseFloat(total) : (parseFloat(subtotal) + parseFloat(tax) - (discount ? parseFloat(discount) : 0)));
            const invoice = await this.financeService.createInvoice({
                organizationId: orgId, customerId, tripId,
                subtotal: parseFloat(subtotal),
                tax: parseFloat(tax),
                discount: discount ? parseFloat(discount) : 0,
                total: calc,
                dueDate: new Date(dueDate)
            });
            // Audit trail
            await this.financeService.addTransaction({ organizationId: orgId, amount: calc, type: 'INCOME', category: 'INVOICE', description: `[CREATE] Invoice ${invoice.id.slice(0,8)} created for customer ${customerId.slice(0,8)}` }).catch(() => {});
            res.status(201).json({ data: invoice, message: 'Invoice created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getInvoices = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = {
                status: req.query.status as string,
                customerId: req.query.customerId as string
            };
            const invoices = await this.financeService.getInvoices(orgId, filters);
            res.status(200).json({ data: invoices, message: 'Invoices retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve invoices' });
        }
    };

    public getInvoiceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const invoice = await this.financeService.getInvoiceById(req.params.id);
            res.status(200).json({ data: invoice, message: 'Invoice retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public updateInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            const data = { ...req.body };
            if (data.subtotal) data.subtotal = parseFloat(data.subtotal);
            if (data.tax) data.tax = parseFloat(data.tax);
            if (data.discount) data.discount = parseFloat(data.discount);
            if (data.total) data.total = parseFloat(data.total);
            if (data.dueDate) data.dueDate = new Date(data.dueDate);
            if (data.paidAt) data.paidAt = new Date(data.paidAt);
            // Recalculate total if line items changed
            if (data.subtotal !== undefined || data.tax !== undefined || data.discount !== undefined) {
                const existing = await this.financeService.getInvoiceById(req.params.id);
                data.total = (data.subtotal ?? (existing as any).subtotal) + (data.tax ?? (existing as any).tax) - (data.discount ?? (existing as any).discount ?? 0);
            }

            const invoice = await this.financeService.updateInvoice(req.params.id, data);
            // Audit trail
            if (orgId) await this.financeService.addTransaction({ organizationId: orgId, amount: invoice.total, type: 'INCOME', category: 'INVOICE', description: `[EDIT] Invoice ${invoice.id.slice(0,8)} updated — status: ${invoice.status}` }).catch(() => {});
            res.status(200).json({ data: invoice, message: 'Invoice updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public deleteInvoice = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.financeService.deleteInvoice(req.params.id);
            res.status(200).json({ data: null, message: 'Invoice deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ─── Payment ────────────────────────────────────

    public recordPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            const { invoiceId, amount, method, status } = req.body;
            if (!invoiceId || !amount || !method || !status) {
                res.status(400).json({ error: 'Invoice ID, amount, method, and status are required' }); return;
            }

            const payment = await this.financeService.recordPayment({
                invoiceId, amount: parseFloat(amount), method, status
            });
            // Audit trail
            if (orgId) await this.financeService.addTransaction({ organizationId: orgId, amount: parseFloat(amount), type: 'INCOME', category: 'PAYMENT', description: `[CREATE] Payment ₹${amount} received via ${method} for invoice ${invoiceId.slice(0,8)}` }).catch(() => {});
            res.status(201).json({ data: payment, message: 'Payment recorded successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getPayments = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const payments = await this.financeService.getPayments(orgId);
            res.status(200).json({ data: payments, message: 'Payments retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve payments' });
        }
    };

    // ─── Expense ────────────────────────────────────

    public createExpense = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { vehicleId, driverId, tripId, category, amount, vendor, notes, expenseDate } = req.body;
            if (!category || !amount) {
                res.status(400).json({ error: 'Category and amount are required' }); return;
            }

            const expense = await this.financeService.createExpense({
                organizationId: orgId, vehicleId, driverId, tripId,
                category, amount: parseFloat(amount), vendor, notes,
                expenseDate: expenseDate ? new Date(expenseDate) : undefined
            });
            // Audit trail
            await this.financeService.addTransaction({ organizationId: orgId, amount: parseFloat(amount), type: 'EXPENSE', category, description: `[CREATE] Expense — ${vendor || category}${notes ? ': ' + notes : ''}` }).catch(() => {});
            res.status(201).json({ data: expense, message: 'Expense created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getExpenses = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = {
                category: req.query.category as string,
                vehicleId: req.query.vehicleId as string,
                driverId: req.query.driverId as string,
                tripId: req.query.tripId as string
            };
            const expenses = await this.financeService.getExpenses(orgId, filters);
            res.status(200).json({ data: expenses, message: 'Expenses retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve expenses' });
        }
    };

    public getExpenseById = async (req: Request, res: Response): Promise<void> => {
        try {
            const expense = await this.financeService.getExpenseById(req.params.id);
            res.status(200).json({ data: expense, message: 'Expense retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public updateExpense = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            const data = { ...req.body };
            if (data.amount) data.amount = parseFloat(data.amount);
            if (data.expenseDate) data.expenseDate = new Date(data.expenseDate);

            const expense = await this.financeService.updateExpense(req.params.id, data);
            // Audit trail
            if (orgId) await this.financeService.addTransaction({ organizationId: orgId, amount: expense.amount, type: 'EXPENSE', category: expense.category, description: `[EDIT] Expense ${expense.id.slice(0,8)} updated — ${expense.vendor || expense.category}` }).catch(() => {});
            res.status(200).json({ data: expense, message: 'Expense updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public deleteExpense = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.financeService.deleteExpense(req.params.id);
            res.status(200).json({ data: null, message: 'Expense deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ─── FuelLog ────────────────────────────────────

    public createFuelLog = async (req: Request, res: Response): Promise<void> => {
        try {
            const { vehicleId, tripId, liters, cost, odometer } = req.body;
            if (!vehicleId || !liters || !cost || !odometer) {
                res.status(400).json({ error: 'Vehicle ID, liters, cost, and odometer are required' }); return;
            }

            const log = await this.financeService.createFuelLog({
                vehicleId, tripId,
                liters: parseFloat(liters),
                cost: parseFloat(cost),
                odometer: parseFloat(odometer)
            });
            res.status(201).json({ data: log, message: 'Fuel log created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getFuelLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = {
                vehicleId: req.query.vehicleId as string,
                tripId: req.query.tripId as string
            };
            const logs = await this.financeService.getFuelLogs(orgId, filters);
            res.status(200).json({ data: logs, message: 'Fuel logs retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve fuel logs' });
        }
    };

    public getFuelLogById = async (req: Request, res: Response): Promise<void> => {
        try {
            const log = await this.financeService.getFuelLogById(req.params.id);
            res.status(200).json({ data: log, message: 'Fuel log retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    // ─── MaintenanceLog ─────────────────────────────

    public createMaintenanceLog = async (req: Request, res: Response): Promise<void> => {
        try {
            const { vehicleId, maintenanceType, cost, vendor, notes, nextDue } = req.body;
            if (!vehicleId || !maintenanceType || !cost) {
                res.status(400).json({ error: 'Vehicle ID, maintenance type, and cost are required' }); return;
            }

            const log = await this.financeService.createMaintenanceLog({
                vehicleId, maintenanceType,
                cost: parseFloat(cost), vendor, notes,
                nextDue: nextDue ? new Date(nextDue) : undefined
            });
            res.status(201).json({ data: log, message: 'Maintenance log created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getMaintenanceLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const vehicleId = req.query.vehicleId as string;
            if (!vehicleId) {
                res.status(400).json({ error: 'Vehicle ID query parameter is required' }); return;
            }

            const logs = await this.financeService.getMaintenanceLogs(vehicleId);
            res.status(200).json({ data: logs, message: 'Maintenance logs retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve maintenance logs' });
        }
    };

    public getMaintenanceLogById = async (req: Request, res: Response): Promise<void> => {
        try {
            const log = await this.financeService.getMaintenanceLogById(req.params.id);
            res.status(200).json({ data: log, message: 'Maintenance log retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    // ─── Payroll ────────────────────────────────────

    public createPayroll = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            const { driverId, month, baseSalary, bonus, deductions, netPay } = req.body;
            if (!driverId || !month || !baseSalary) {
                res.status(400).json({ error: 'Driver ID, month, and base salary are required' }); return;
            }

            const base = parseFloat(baseSalary);
            const bon = bonus ? parseFloat(bonus) : 0;
            const ded = deductions ? parseFloat(deductions) : 0;
            const net = netPay ? parseFloat(netPay) : base + bon - ded;

            const payroll = await this.financeService.createPayroll({
                driverId,
                month: new Date(month),
                baseSalary: base,
                bonus: bon || undefined,
                deductions: ded || undefined,
                netPay: net
            });
            // Audit trail
            if (orgId) await this.financeService.addTransaction({ organizationId: orgId, amount: net, type: 'EXPENSE', category: 'SALARY', description: `[CREATE] Payroll — driver ${driverId.slice(0,8)}, net ₹${net}` }).catch(() => {});
            res.status(201).json({ data: payroll, message: 'Payroll record created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getPayrolls = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = {
                driverId: req.query.driverId as string,
                month: req.query.month as string
            };
            const payrolls = await this.financeService.getPayrolls(orgId, filters);
            res.status(200).json({ data: payrolls, message: 'Payroll records retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve payroll records' });
        }
    };

    public getPayrollById = async (req: Request, res: Response): Promise<void> => {
        try {
            const payroll = await this.financeService.getPayrollById(req.params.id);
            res.status(200).json({ data: payroll, message: 'Payroll record retrieved successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public updatePayroll = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = { ...req.body };
            if (data.baseSalary) data.baseSalary = parseFloat(data.baseSalary);
            if (data.bonus) data.bonus = parseFloat(data.bonus);
            if (data.deductions) data.deductions = parseFloat(data.deductions);
            if (data.netPay) data.netPay = parseFloat(data.netPay);
            if (data.paidAt) data.paidAt = new Date(data.paidAt);

            const payroll = await this.financeService.updatePayroll(req.params.id, data);
            res.status(200).json({ data: payroll, message: 'Payroll record updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ─── Receivable ─────────────────────────────────

    public getReceivables = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = { status: req.query.status as string };
            const receivables = await this.financeService.getReceivables(orgId, filters);
            res.status(200).json({ data: receivables, message: 'Receivables retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve receivables' });
        }
    };

    public updateReceivable = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = { ...req.body };
            if (data.amountDue) data.amountDue = parseFloat(data.amountDue);
            if (data.dueDate) data.dueDate = new Date(data.dueDate);

            const receivable = await this.financeService.updateReceivable(req.params.id, data);
            res.status(200).json({ data: receivable, message: 'Receivable updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ─── Payable ────────────────────────────────────

    public createPayable = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { vendor, amount, dueDate, status } = req.body;
            if (!vendor || !amount || !dueDate) {
                res.status(400).json({ error: 'Vendor, amount, and due date are required' }); return;
            }

            const payable = await this.financeService.createPayable({
                organizationId: orgId, vendor,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                status: status || 'PENDING'
            });
            res.status(201).json({ data: payable, message: 'Payable created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getPayables = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const filters = { status: req.query.status as string };
            const payables = await this.financeService.getPayables(orgId, filters);
            res.status(200).json({ data: payables, message: 'Payables retrieved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve payables' });
        }
    };

    public updatePayable = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = { ...req.body };
            if (data.amount) data.amount = parseFloat(data.amount);
            if (data.dueDate) data.dueDate = new Date(data.dueDate);

            const payable = await this.financeService.updatePayable(req.params.id, data);
            res.status(200).json({ data: payable, message: 'Payable updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
