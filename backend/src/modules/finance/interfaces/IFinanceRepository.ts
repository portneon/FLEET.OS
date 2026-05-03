import { Transaction, TransactionType, Customer, Invoice, Payment, Expense, FuelLog, MaintenanceLog, Payroll, Receivable, Payable, ExpenseCategory, PayableStatus } from '@prisma/client';



export interface CreateTransactionDTO {
    organizationId: string;
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
}



export interface CreateCustomerDTO {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    customerType: 'INDIVIDUAL' | 'BUSINESS';
}

export interface UpdateCustomerDTO {
    name?: string;
    email?: string;
    phone?: string;
    customerType?: 'INDIVIDUAL' | 'BUSINESS';
}



export interface CreateInvoiceDTO {
    organizationId: string;
    customerId: string;
    tripId?: string;
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    dueDate: Date;
}

export interface UpdateInvoiceDTO {
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate?: Date;
    paidAt?: Date;
}

// ─── Payment ────────────────────────────────────────

export interface CreatePaymentDTO {
    invoiceId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI';
    status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
}

// ─── Expense ────────────────────────────────────────

export interface CreateExpenseDTO {
    organizationId: string;
    vehicleId?: string;
    driverId?: string;
    tripId?: string;
    category: 'FUEL' | 'MAINTENANCE' | 'SALARY' | 'INSURANCE' | 'TAX' | 'TOLL' | 'RENT' | 'PARKING' | 'LOAN_PAYMENT' | 'OTHER';
    amount: number;
    vendor?: string;
    notes?: string;
    expenseDate?: Date;
}

export interface UpdateExpenseDTO {
    category?: ExpenseCategory;
    amount?: number;
    vendor?: string;
    notes?: string;
    expenseDate?: Date;
}

// ─── FuelLog ────────────────────────────────────────

export interface CreateFuelLogDTO {
    vehicleId: string;
    tripId?: string;
    liters: number;
    cost: number;
    odometer: number;
}

// ─── MaintenanceLog ─────────────────────────────────

export interface CreateMaintenanceLogDTO {
    vehicleId: string;
    maintenanceType: string;
    cost: number;
    vendor?: string;
    notes?: string;
    nextDue?: Date;
}

// ─── Payroll ────────────────────────────────────────

export interface CreatePayrollDTO {
    driverId: string;
    month: Date;
    baseSalary: number;
    bonus?: number;
    deductions?: number;
    netPay: number;
}

export interface UpdatePayrollDTO {
    baseSalary?: number;
    bonus?: number;
    deductions?: number;
    netPay?: number;
    paidAt?: Date;
}

// ─── Receivable ─────────────────────────────────────

export interface UpdateReceivableDTO {
    amountDue?: number;
    dueDate?: Date;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
}

// ─── Payable ────────────────────────────────────────

export interface CreatePayableDTO {
    organizationId: string;
    vendor: string;
    amount: number;
    dueDate: Date;
    status: PayableStatus;
}

export interface UpdatePayableDTO {
    vendor?: string;
    amount?: number;
    dueDate?: Date;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
}

// ─── Repository Contract ────────────────────────────

export interface IFinanceRepository {
    // Transaction (legacy + audit trail)
    create(data: CreateTransactionDTO): Promise<Transaction>;
    findByOrganization(organizationId: string, filters?: { category?: string; type?: string }, limit?: number): Promise<Transaction[]>;
    updateTransaction(id: string, data: { amount?: number; category?: string; description?: string }): Promise<Transaction>;
    deleteTransaction(id: string): Promise<void>;

    // Customer
    createCustomer(data: CreateCustomerDTO): Promise<Customer>;
    findCustomersByOrg(organizationId: string): Promise<Customer[]>;
    findCustomerById(id: string): Promise<Customer | null>;
    updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer>;
    deleteCustomer(id: string): Promise<void>;

    // Invoice
    createInvoice(data: CreateInvoiceDTO): Promise<Invoice>;
    findInvoicesByOrg(organizationId: string, filters?: { status?: string; customerId?: string }): Promise<Invoice[]>;
    findInvoiceById(id: string): Promise<Invoice | null>;
    updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<Invoice>;
    deleteInvoice(id: string): Promise<void>;

    // Payment
    createPayment(data: CreatePaymentDTO): Promise<Payment>;
    findPaymentsByOrg(organizationId: string): Promise<Payment[]>;

    // Expense
    createExpense(data: CreateExpenseDTO): Promise<Expense>;
    findExpensesByOrg(organizationId: string, filters?: { category?: string; vehicleId?: string; driverId?: string; tripId?: string }): Promise<Expense[]>;
    findExpenseById(id: string): Promise<Expense | null>;
    updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense>;
    deleteExpense(id: string): Promise<void>;

    // FuelLog
    createFuelLog(data: CreateFuelLogDTO): Promise<FuelLog>;
    findFuelLogsByOrg(organizationId: string, filters?: { vehicleId?: string; tripId?: string }): Promise<FuelLog[]>;
    findFuelLogById(id: string): Promise<FuelLog | null>;

    // MaintenanceLog
    createMaintenanceLog(data: CreateMaintenanceLogDTO): Promise<MaintenanceLog>;
    findMaintenanceLogsByVehicle(vehicleId: string): Promise<MaintenanceLog[]>;
    findMaintenanceLogById(id: string): Promise<MaintenanceLog | null>;

    // Payroll
    createPayroll(data: CreatePayrollDTO): Promise<Payroll>;
    findPayrollsByOrg(organizationId: string, filters?: { driverId?: string; month?: string }): Promise<Payroll[]>;
    findPayrollById(id: string): Promise<Payroll | null>;
    updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll>;

    // Receivable
    createReceivable(data: { organizationId: string; invoiceId: string; amountDue: number; dueDate: Date; status: 'PENDING' | 'PAID' | 'OVERDUE' }): Promise<Receivable>;
    findReceivablesByOrg(organizationId: string, filters?: { status?: string }): Promise<Receivable[]>;
    updateReceivable(id: string, data: UpdateReceivableDTO): Promise<Receivable>;

    // Payable
    createPayable(data: CreatePayableDTO): Promise<Payable>;
    findPayablesByOrg(organizationId: string, filters?: { status?: string }): Promise<Payable[]>;
    updatePayable(id: string, data: UpdatePayableDTO): Promise<Payable>;
}