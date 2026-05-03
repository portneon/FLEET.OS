import { Transaction, Customer, Invoice, Payment, Expense, FuelLog, MaintenanceLog, Payroll, Receivable, Payable } from '@prisma/client';
import {
    CreateCustomerDTO, UpdateCustomerDTO,
    CreateInvoiceDTO, UpdateInvoiceDTO,
    CreatePaymentDTO,
    CreateExpenseDTO, UpdateExpenseDTO,
    CreateFuelLogDTO,
    CreateMaintenanceLogDTO,
    CreatePayrollDTO, UpdatePayrollDTO,
    UpdateReceivableDTO,
    CreatePayableDTO, UpdatePayableDTO
} from './IFinanceRepository';

// ─── Legacy Summary ─────────────────────────────────

export interface FinanceSummary {
    revenue: number;
    expenses: number;
    profit: number;
    recentActivity: Transaction[];
}

// ─── Dashboard Summary (new — from real models) ─────

export interface FinanceDashboard {
    totalInvoiced: number;
    totalPaid: number;
    totalExpenses: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalPayroll: number;
    netProfit: number;
    pendingReceivables: number;
    pendingPayables: number;
    overdueInvoices: number;
}

// ─── Service Contract ───────────────────────────────

export interface IFinanceService {
    // Transaction Audit Trail
    getSummary(organizationId: string, filters?: { category?: string; type?: string }): Promise<FinanceSummary>;
    addTransaction(data: { organizationId: string; amount: number; type: string; category: string; description?: string }): Promise<Transaction>;
    updateTransaction(id: string, data: { amount?: number; category?: string; description?: string }): Promise<Transaction>;
    deleteTransaction(id: string): Promise<void>;

    // Dashboard
    getDashboard(organizationId: string): Promise<FinanceDashboard>;

    // Customer
    createCustomer(data: CreateCustomerDTO): Promise<Customer>;
    getCustomers(organizationId: string): Promise<Customer[]>;
    getCustomerById(id: string): Promise<Customer>;
    updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer>;
    deleteCustomer(id: string): Promise<void>;

    // Invoice
    createInvoice(data: CreateInvoiceDTO): Promise<Invoice>;
    getInvoices(organizationId: string, filters?: { status?: string; customerId?: string }): Promise<Invoice[]>;
    getInvoiceById(id: string): Promise<Invoice>;
    updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<Invoice>;
    deleteInvoice(id: string): Promise<void>;

    // Payment
    recordPayment(data: CreatePaymentDTO): Promise<Payment>;
    getPayments(organizationId: string): Promise<Payment[]>;

    // Expense
    createExpense(data: CreateExpenseDTO): Promise<Expense>;
    getExpenses(organizationId: string, filters?: { category?: string; vehicleId?: string; driverId?: string; tripId?: string }): Promise<Expense[]>;
    getExpenseById(id: string): Promise<Expense>;
    updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense>;
    deleteExpense(id: string): Promise<void>;

    // FuelLog
    createFuelLog(data: CreateFuelLogDTO): Promise<FuelLog>;
    getFuelLogs(organizationId: string, filters?: { vehicleId?: string; tripId?: string }): Promise<FuelLog[]>;
    getFuelLogById(id: string): Promise<FuelLog>;

    // MaintenanceLog
    createMaintenanceLog(data: CreateMaintenanceLogDTO): Promise<MaintenanceLog>;
    getMaintenanceLogs(vehicleId: string): Promise<MaintenanceLog[]>;
    getMaintenanceLogById(id: string): Promise<MaintenanceLog>;

    // Payroll
    createPayroll(data: CreatePayrollDTO): Promise<Payroll>;
    getPayrolls(organizationId: string, filters?: { driverId?: string; month?: string }): Promise<Payroll[]>;
    getPayrollById(id: string): Promise<Payroll>;
    updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll>;

    // Receivable
    getReceivables(organizationId: string, filters?: { status?: string }): Promise<Receivable[]>;
    updateReceivable(id: string, data: UpdateReceivableDTO): Promise<Receivable>;

    // Payable
    createPayable(data: CreatePayableDTO): Promise<Payable>;
    getPayables(organizationId: string, filters?: { status?: string }): Promise<Payable[]>;
    updatePayable(id: string, data: UpdatePayableDTO): Promise<Payable>;
}