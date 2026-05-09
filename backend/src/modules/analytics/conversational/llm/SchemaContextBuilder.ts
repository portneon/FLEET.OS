import { ALLOWED_MODELS, BLOCKED_FIELDS } from '../config/analyticsConfig';

/**
 * SchemaContextBuilder
 * Generates a sanitized, text-based description of the allowed Prisma models
 * and their fields to provide context to the LLM for query generation.
 */
export class SchemaContextBuilder {
  static getSanitizedSchema(): string {
    // This is a simplified representation of the Prisma schema
    // containing only allowed models and non-blocked fields.
    
    return `
ALLOWED MODELS AND FIELDS:

- Transaction: { id, amount, type (INCOME|EXPENSE), category, description, createdAt }
- Trip: { id, status, scheduledStart, scheduledEnd, vehicleId, driverId, routeId }
- Booking: { id, status, amount, userId, tripId, createdAt }
- Vehicle: { id, type (BUS|TRUCK|VAN), status, seatingCapacity, purchasePrice }
- Expense: { id, amount, category, expenseDate, vehicleId, driverId }
- FuelLog: { id, liters, cost, odometer, vehicleId }
- MaintenanceLog: { id, maintenanceType, cost, vehicleId }
- Payroll: { id, month, baseSalary, bonus, deductions, netPay, driverId }
- Customer: { id, name, customerType (INDIVIDUAL|BUSINESS) }
- Invoice: { id, status, total, subtotal, tax, dueDate, issuedAt, customerId }
- Payment: { id, amount, status (SUCCESS|FAILED|PENDING), method, paidAt }
- Receivable: { id, amountDue, status, dueDate, customerId }
- Payable: { id, vendor, amount, status, dueDate }

Note: All queries must focus on READ operations. 
Sensitive fields like passwords, personal phone numbers, and VINs are strictly blocked and NOT available.
`;
  }
}
