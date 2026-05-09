import { PrismaClient, TransactionType } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

const AGGREGATE_FIELDS: Record<string, { model: string; field: string; filter: string }> = {
  revenue: { model: 'transaction', field: 'amount', filter: 'INCOME' },
  expenses_total: { model: 'transaction', field: 'amount', filter: 'EXPENSE' },
  total_trips: { model: 'trip', field: 'id', filter: 'ALL' },
  total_bookings: { model: 'booking', field: 'id', filter: 'ALL' },
  total_invoiced: { model: 'invoice', field: 'total', filter: 'ALL' },
  total_paid_invoices: { model: 'invoice', field: 'total', filter: 'PAID' },
  total_expenses: { model: 'expense', field: 'amount', filter: 'ALL' },
  fuel_cost: { model: 'expense', field: 'amount', filter: 'FUEL' },
  maintenance_cost: { model: 'expense', field: 'amount', filter: 'MAINTENANCE' },
  payroll_total: { model: 'expense', field: 'amount', filter: 'SALARY' },
  total_receivables: { model: 'receivable', field: 'amountDue', filter: 'ALL' },
  pending_receivables: { model: 'receivable', field: 'amountDue', filter: 'PENDING' },
  total_payables: { model: 'payable', field: 'amount', filter: 'ALL' },
  pending_payables: { model: 'payable', field: 'amount', filter: 'PENDING' },
};

export const aggregateMetricTool: AnalyticsTool = {
  name: 'aggregateMetric',
  description:
    'Compute a single aggregate value (sum, avg, count, min, max) for a business metric over a date range.',
  domains: ['finance', 'fleet', 'trips', 'drivers', 'customers', 'operations', 'general'],
  parameters: [
    { name: 'metric', type: 'enum', required: true, description: 'The metric to aggregate', enumValues: Object.keys(AGGREGATE_FIELDS) },
    { name: 'operation', type: 'enum', required: true, description: 'Aggregation operation', enumValues: ['sum', 'count', 'avg', 'min', 'max'] },
    { name: 'startDate', type: 'string', required: false, description: 'ISO date string for start of range' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO date string for end of range' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { metric, operation, startDate, endDate } = params;
    const def = AGGREGATE_FIELDS[metric];
    if (!def) throw new Error(`Unknown metric: ${metric}`);

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const buildWhere = (extra: any = {}) => ({
      organizationId: orgId,
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
      ...extra,
    });

    let value: number = 0;

    if (def.model === 'transaction') {
      const where = buildWhere(def.filter !== 'ALL' ? { type: def.filter as TransactionType } : {});
      if (operation === 'sum') {
        const res = await (prisma.transaction as any).aggregate({ _sum: { amount: true }, where });
        value = res._sum.amount ?? 0;
      } else if (operation === 'count') {
        value = await (prisma.transaction as any).count({ where });
      } else if (operation === 'avg') {
        const res = await (prisma.transaction as any).aggregate({ _avg: { amount: true }, where });
        value = res._avg.amount ?? 0;
      }
    } else if (def.model === 'invoice') {
      const where: any = { organizationId: orgId };
      if (def.filter !== 'ALL') where.status = def.filter;
      if (Object.keys(dateFilter).length) where.issuedAt = dateFilter;
      if (operation === 'sum') {
        const res = await (prisma.invoice as any).aggregate({ _sum: { total: true }, where });
        value = res._sum.total ?? 0;
      } else if (operation === 'count') {
        value = await (prisma.invoice as any).count({ where });
      }
    } else if (def.model === 'expense') {
      const where: any = { organizationId: orgId };
      if (def.filter !== 'ALL') where.category = def.filter;
      if (Object.keys(dateFilter).length) where.expenseDate = dateFilter;
      if (operation === 'sum') {
        const res = await (prisma.expense as any).aggregate({ _sum: { amount: true }, where });
        value = res._sum.amount ?? 0;
      } else if (operation === 'count') {
        value = await (prisma.expense as any).count({ where });
      }
    } else if (def.model === 'trip') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.scheduledStart = dateFilter;
      value = await (prisma.trip as any).count({ where });
    } else if (def.model === 'booking') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
      value = await (prisma.booking as any).count({ where });
    } else if (def.model === 'receivable') {
      const where: any = { organizationId: orgId };
      if (def.filter !== 'ALL') where.status = def.filter;
      const res = await (prisma.receivable as any).aggregate({ _sum: { amountDue: true }, where });
      value = res._sum.amountDue ?? 0;
    } else if (def.model === 'payable') {
      const where: any = { organizationId: orgId };
      if (def.filter !== 'ALL') where.status = def.filter;
      const res = await (prisma.payable as any).aggregate({ _sum: { amount: true }, where });
      value = res._sum.amount ?? 0;
    }

    return {
      metric,
      operation,
      value: Math.round(value * 100) / 100,
      currency: ['revenue', 'expenses_total', 'total_invoiced', 'total_paid_invoices',
        'total_expenses', 'fuel_cost', 'maintenance_cost', 'payroll_total',
        'total_receivables', 'pending_receivables', 'total_payables', 'pending_payables'].includes(metric) ? 'INR' : null,
      period: { startDate: startDate ?? null, endDate: endDate ?? null },
    };
  },
};
