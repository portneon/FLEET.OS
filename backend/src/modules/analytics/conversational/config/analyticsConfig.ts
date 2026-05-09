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
