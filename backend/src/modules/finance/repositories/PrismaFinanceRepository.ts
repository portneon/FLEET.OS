import { Transaction, Customer, Invoice, Payment, Expense, FuelLog, MaintenanceLog, Payroll, Receivable, Payable } from '@prisma/client';
import { prisma } from '../../../prisma';
import {
    IFinanceRepository,
    CreateTransactionDTO,
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

export class PrismaFinanceRepository implements IFinanceRepository {

    // ─── Transaction (legacy) ───────────────────────

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

    async findByOrganization(organizationId: string, filters?: { category?: string; type?: string }, limit: number = 100): Promise<Transaction[]> {
        return await prisma.transaction.findMany({
            where: {
                organizationId,
                ...(filters?.category ? { category: filters.category } : {}),
                ...(filters?.type ? { type: filters.type as any } : {}),
            },
            orderBy: { date: 'desc' },
            take: limit
        });
    }

    async updateTransaction(id: string, data: { amount?: number; category?: string; description?: string }): Promise<Transaction> {
        return await prisma.transaction.update({ where: { id }, data });
    }

    async deleteTransaction(id: string): Promise<void> {
        await prisma.transaction.delete({ where: { id } });
    }

    // ─── Customer ───────────────────────────────────

    async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
        return await prisma.customer.create({ data });
    }

    async findCustomersByOrg(organizationId: string): Promise<Customer[]> {
        return await prisma.customer.findMany({
            where: { organizationId },
            include: { invoices: { select: { id: true, total: true, status: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findCustomerById(id: string): Promise<Customer | null> {
        return await prisma.customer.findUnique({
            where: { id },
            include: { invoices: true }
        });
    }

    async updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer> {
        return await prisma.customer.update({ where: { id }, data });
    }

    async deleteCustomer(id: string): Promise<void> {
        await prisma.customer.delete({ where: { id } });
    }

    // ─── Invoice ────────────────────────────────────

    async createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
        return await prisma.invoice.create({
            data,
            include: { customer: true, trip: true }
        });
    }

    async findInvoicesByOrg(organizationId: string, filters?: { status?: string; customerId?: string }): Promise<Invoice[]> {
        return await prisma.invoice.findMany({
            where: {
                organizationId,
                ...(filters?.status ? { status: filters.status as any } : {}),
                ...(filters?.customerId ? { customerId: filters.customerId } : {})
            },
            include: { customer: true, payments: true, receivable: true },
            orderBy: { issuedAt: 'desc' }
        });
    }

    async findInvoiceById(id: string): Promise<Invoice | null> {
        return await prisma.invoice.findUnique({
            where: { id },
            include: { customer: true, trip: true, payments: true, receivable: true }
        });
    }

    async updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<Invoice> {
        return await prisma.invoice.update({
            where: { id },
            data,
            include: { customer: true, payments: true, receivable: true }
        });
    }

    async deleteInvoice(id: string): Promise<void> {
        // Delete associated receivable first (1:1 relation)
        await prisma.receivable.deleteMany({ where: { invoiceId: id } });
        await prisma.payment.deleteMany({ where: { invoiceId: id } });
        await prisma.invoice.delete({ where: { id } });
    }

    // ─── Payment ────────────────────────────────────

    async createPayment(data: CreatePaymentDTO): Promise<Payment> {
        return await prisma.payment.create({
            data,
            include: { invoice: true }
        });
    }

    async findPaymentsByOrg(organizationId: string): Promise<Payment[]> {
        return await prisma.payment.findMany({
            where: { invoice: { organizationId } },
            include: { invoice: { select: { id: true, total: true, customerId: true } } },
            orderBy: { paidAt: 'desc' }
        });
    }

    // ─── Expense ────────────────────────────────────

    async createExpense(data: CreateExpenseDTO): Promise<Expense> {
        return await prisma.expense.create({
            data,
            include: { vehicle: true, driver: true, trip: true }
        });
    }

    async findExpensesByOrg(organizationId: string, filters?: { category?: string; vehicleId?: string; driverId?: string; tripId?: string }): Promise<Expense[]> {
        return await prisma.expense.findMany({
            where: {
                organizationId,
                ...(filters?.category ? { category: filters.category as any } : {}),
                ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
                ...(filters?.driverId ? { driverId: filters.driverId } : {}),
                ...(filters?.tripId ? { tripId: filters.tripId } : {})
            },
            include: { vehicle: true, driver: true, trip: true },
            orderBy: { expenseDate: 'desc' }
        });
    }

    async findExpenseById(id: string): Promise<Expense | null> {
        return await prisma.expense.findUnique({
            where: { id },
            include: { vehicle: true, driver: true, trip: true }
        });
    }

    async updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense> {
        return await prisma.expense.update({
            where: { id },
            data,
            include: { vehicle: true, driver: true, trip: true }
        });
    }

    async deleteExpense(id: string): Promise<void> {
        await prisma.expense.delete({ where: { id } });
    }

    // ─── FuelLog ────────────────────────────────────

    async createFuelLog(data: CreateFuelLogDTO): Promise<FuelLog> {
        return await prisma.fuelLog.create({
            data,
            include: { vehicle: true, trip: true }
        });
    }

    async findFuelLogsByOrg(organizationId: string, filters?: { vehicleId?: string; tripId?: string }): Promise<FuelLog[]> {
        return await prisma.fuelLog.findMany({
            where: {
                vehicle: { organizationId },
                ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
                ...(filters?.tripId ? { tripId: filters.tripId } : {})
            },
            include: { vehicle: true, trip: true },
            orderBy: { filledAt: 'desc' }
        });
    }

    async findFuelLogById(id: string): Promise<FuelLog | null> {
        return await prisma.fuelLog.findUnique({
            where: { id },
            include: { vehicle: true, trip: true }
        });
    }

    // ─── MaintenanceLog ─────────────────────────────

    async createMaintenanceLog(data: CreateMaintenanceLogDTO): Promise<MaintenanceLog> {
        return await prisma.maintenanceLog.create({
            data,
            include: { vehicle: true }
        });
    }

    async findMaintenanceLogsByVehicle(vehicleId: string): Promise<MaintenanceLog[]> {
        return await prisma.maintenanceLog.findMany({
            where: { vehicleId },
            include: { vehicle: true },
            orderBy: { servicedAt: 'desc' }
        });
    }

    async findMaintenanceLogById(id: string): Promise<MaintenanceLog | null> {
        return await prisma.maintenanceLog.findUnique({
            where: { id },
            include: { vehicle: true }
        });
    }

    // ─── Payroll ────────────────────────────────────

    async createPayroll(data: CreatePayrollDTO): Promise<Payroll> {
        return await prisma.payroll.create({
            data,
            include: { driver: { include: { user: true } } }
        });
    }

    async findPayrollsByOrg(organizationId: string, filters?: { driverId?: string; month?: string }): Promise<Payroll[]> {
        const where: any = {
            driver: { user: { organizationId } }
        };
        if (filters?.driverId) where.driverId = filters.driverId;
        if (filters?.month) {
            const monthDate = new Date(filters.month);
            const nextMonth = new Date(monthDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            where.month = { gte: monthDate, lt: nextMonth };
        }

        return await prisma.payroll.findMany({
            where,
            include: { driver: { include: { user: true } } },
            orderBy: { month: 'desc' }
        });
    }

    async findPayrollById(id: string): Promise<Payroll | null> {
        return await prisma.payroll.findUnique({
            where: { id },
            include: { driver: { include: { user: true } } }
        });
    }

    async updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll> {
        return await prisma.payroll.update({
            where: { id },
            data,
            include: { driver: { include: { user: true } } }
        });
    }

    // ─── Receivable ─────────────────────────────────

    async createReceivable(data: { organizationId: string; invoiceId: string; amountDue: number; dueDate: Date; status: 'PENDING' | 'PAID' | 'OVERDUE' }): Promise<Receivable> {
        return await prisma.receivable.create({
            data,
            include: { invoice: true }
        });
    }

    async findReceivablesByOrg(organizationId: string, filters?: { status?: string }): Promise<Receivable[]> {
        return await prisma.receivable.findMany({
            where: {
                organizationId,
                ...(filters?.status ? { status: filters.status as any } : {})
            },
            include: { invoice: { include: { customer: true } } },
            orderBy: { dueDate: 'asc' }
        });
    }

    async updateReceivable(id: string, data: UpdateReceivableDTO): Promise<Receivable> {
        return await prisma.receivable.update({
            where: { id },
            data,
            include: { invoice: true }
        });
    }

    // ─── Payable ────────────────────────────────────

    async createPayable(data: CreatePayableDTO): Promise<Payable> {
        return await prisma.payable.create({ data });
    }

    async findPayablesByOrg(organizationId: string, filters?: { status?: string }): Promise<Payable[]> {
        return await prisma.payable.findMany({
            where: {
                organizationId,
                ...(filters?.status ? { status: filters.status as any } : {})
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async updatePayable(id: string, data: UpdatePayableDTO): Promise<Payable> {
        return await prisma.payable.update({ where: { id }, data });
    }
}