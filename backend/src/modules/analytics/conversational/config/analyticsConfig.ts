/**
 * Analytics Security Configuration — Single source of truth for AI engine access.
 * The engine is STRICTLY read-only. The LLM and tool executor can NEVER mutate data.
 */

// ─── Allowed Prisma models (safe for analytics) ───────────────────────────────
export const ALLOWED_MODELS = [
  'transaction', 'trip', 'booking', 'vehicle', 'expense',
  'fuelLog', 'maintenanceLog', 'payroll', 'customer',
  'invoice', 'payment', 'receivable', 'payable', 'route', 'driverProfile',
] as const;

// ─── Blocked Prisma models (never accessed) ───────────────────────────────────
export const BLOCKED_MODELS = ['user', 'wallet', 'loan', 'telemetry', 'organization'] as const;

// ─── Blocked fields (stripped from EVERY response, deep recursive scan) ────────
export const BLOCKED_FIELDS = new Set([
  // Auth & Secrets
  'password', 'passwordhash', 'token', 'secret', 'apikey', 'refreshtoken', 'accesstoken',
  // User PII
  'email', 'phone', 'phonenumber', 'mobilenumber', 'address', 'dateofbirth', 'dob',
  'nationalid', 'passportnumber', 'ssn', 'taxid',
  // Driver PII
  'licensenumber', 'drivinglicense', 'driverphone', 'driveremail',
  // Vehicle sensitive identifiers
  'vin', 'licenseplate', 'numberplate', 'registrationnumber',
  // User names (privacy)
  'username', 'firstname', 'lastname', 'fullname',
]);

// ─── Analytics domains ────────────────────────────────────────────────────────
export type AnalyticsDomain =
  | 'finance' | 'fleet' | 'trips' | 'drivers'
  | 'customers' | 'operations' | 'general';

// ─── Role → allowed domains ───────────────────────────────────────────────────
export const ROLE_DOMAIN_ACCESS: Record<string, AnalyticsDomain[]> = {
  ADMIN:        ['finance', 'fleet', 'trips', 'drivers', 'customers', 'operations', 'general'],
  FINANCE:      ['finance', 'customers', 'general'],
  DISPATCHER:   ['trips', 'fleet', 'operations', 'general'],
  ROUTE_PLANNER:['trips', 'operations', 'fleet', 'general'],
  DRIVER:       [],
  PASSENGER:    [],
};

// ─── Rate limiting ────────────────────────────────────────────────────────────
export const RATE_LIMIT = {
  maxQueriesPerMinute: 20,
  maxSessionsPerOrg:   50,
  maxHistoryTurns:     8,
  sessionTTLMinutes:   60,
};

// ─── LLM constraints ──────────────────────────────────────────────────────────
export const LLM_CONFIG = {
  model:                 'llama-3.3-70b-versatile',
  maxInputTokens:        4096,
  maxOutputTokens:       600,
  temperature:           0.1,
  narrativeMaxTokens:    400,
  narrativeTemperature:  0.4,
};

// ─── Shared Database Schema Reference for LLM ──────────────────────────────────
export const DB_SCHEMA = `
Models & Key Fields (for direct SQL SELECT queries):
- User: id, email, role('ADMIN','DISPATCHER','DRIVER','FINANCE'), organizationId
- DriverProfile: id, userId, licenseNumber, experience, performance, status('AVAILABLE','ON_TRIP','OFF_DUTY')  (No organizationId; join User)
- Vehicle: id, vin, type('BUS','TRUCK','VAN'), licensePlate, seatingCapacity, status, purchasePrice, purchaseDate, residualValue, insuranceCost, loanAmount, monthlyEmi, organizationId
- Fleet: id, name, organizationId
- Route: id, name, organizationId
- Stop: id, name, latitude, longitude, organizationId
- Booking: id, tripId, userId, amount, status('CONFIRMED','CANCELLED','COMPLETED'), organizationId, createdAt
- Trip: id, routeId, vehicleId, driverId, status('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'), scheduledStart, actualStart, actualEnd, organizationId
- Transaction: id, amount, type('INCOME','EXPENSE'), category, description, date, organizationId
- Customer: id, name, email, phone, customerType('INDIVIDUAL','BUSINESS'), organizationId
- Invoice: id, customerId, tripId, subtotal, tax, discount, total, status('PENDING','PAID','OVERDUE','CANCELLED'), issuedAt, dueDate, paidAt, organizationId
- Payment: id, invoiceId, amount, method('CASH','CARD','BANK_TRANSFER','UPI'), status('SUCCESS','FAILED','REFUNDED'), paidAt  (No organizationId; join Invoice)
- Expense: id, vehicleId, driverId, tripId, category('FUEL','MAINTENANCE','SALARY','INSURANCE','TAX','TOLL','RENT','PARKING','LOAN_PAYMENT','OTHER'), amount, vendor, notes, expenseDate, organizationId
- FuelLog: id, vehicleId, tripId, liters, cost, odometer, filledAt (No organizationId; join Vehicle or Trip)
- MaintenanceLog: id, vehicleId, maintenanceType, cost, vendor, notes, servicedAt, nextDue (No organizationId; join Vehicle)
- Payroll: id, driverId, month, baseSalary, bonus, deductions, netPay, paidAt (No organizationId; join DriverProfile -> User)
- Receivable: id, invoiceId, amountDue, dueDate, status('PENDING','PAID','OVERDUE'), organizationId
- Payable: id, vendor, amount, dueDate, status('PENDING','PAID','OVERDUE'), organizationId
`;
