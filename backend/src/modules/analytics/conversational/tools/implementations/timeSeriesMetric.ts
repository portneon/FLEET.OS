import { PrismaClient, TransactionType } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

export const timeSeriesMetricTool: AnalyticsTool = {
  name: 'timeSeriesMetric',
  description:
    'Return a time-series of a metric (e.g. monthly revenue trend, daily trips, weekly expenses) for charting.',
  domains: ['finance', 'trips', 'fleet', 'operations', 'general'],
  parameters: [
    {
      name: 'metric',
      type: 'enum',
      required: true,
      description: 'The metric to chart over time',
      enumValues: ['revenue', 'expenses', 'profit', 'trips', 'bookings', 'fuel_cost', 'maintenance_cost'],
    },
    {
      name: 'granularity',
      type: 'enum',
      required: true,
      description: 'Time bucket size',
      enumValues: ['day', 'week', 'month', 'quarter', 'year'],
    },
    { name: 'startDate', type: 'string', required: false, description: 'ISO start date' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO end date' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { metric, granularity, startDate, endDate } = params;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const formatKey = (d: Date): string => {
      if (granularity === 'day') return d.toISOString().slice(0, 10);
      if (granularity === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().slice(0, 10);
      }
      if (granularity === 'month') return d.toISOString().slice(0, 7);
      if (granularity === 'quarter') {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        return `${d.getFullYear()}-Q${q}`;
      }
      return String(d.getFullYear());
    };

    const buckets: Record<string, number> = {};

    if (metric === 'revenue' || metric === 'expenses' || metric === 'profit') {
      const type = metric === 'revenue' ? TransactionType.INCOME : TransactionType.EXPENSE;
      const where: any = { organizationId: orgId, createdAt: { gte: start, lte: end } };
      if (metric !== 'profit') where.type = type;

      const txns = await (prisma.transaction as any).findMany({ where });
      for (const t of txns) {
        const key = formatKey(t.createdAt);
        if (metric === 'profit') {
          buckets[key] = (buckets[key] ?? 0) + (t.type === TransactionType.INCOME ? t.amount : -t.amount);
        } else {
          buckets[key] = (buckets[key] ?? 0) + t.amount;
        }
      }
    } else if (metric === 'trips') {
      const trips = await (prisma.trip as any).findMany({
        where: { organizationId: orgId, scheduledStart: { gte: start, lte: end } },
      });
      for (const t of trips) {
        const key = formatKey(t.scheduledStart);
        buckets[key] = (buckets[key] ?? 0) + 1;
      }
    } else if (metric === 'bookings') {
      const bks = await (prisma.booking as any).findMany({
        where: { organizationId: orgId, createdAt: { gte: start, lte: end } },
      });
      for (const b of bks) {
        const key = formatKey(b.createdAt);
        buckets[key] = (buckets[key] ?? 0) + 1;
      }
    } else if (metric === 'fuel_cost') {
      const rows = await (prisma.expense as any).findMany({
        where: { organizationId: orgId, category: 'FUEL', expenseDate: { gte: start, lte: end } },
      });
      for (const r of rows) {
        const key = formatKey(r.expenseDate);
        buckets[key] = (buckets[key] ?? 0) + r.amount;
      }
    } else if (metric === 'maintenance_cost') {
      const rows = await (prisma.expense as any).findMany({
        where: { organizationId: orgId, category: 'MAINTENANCE', expenseDate: { gte: start, lte: end } },
      });
      for (const r of rows) {
        const key = formatKey(r.expenseDate);
        buckets[key] = (buckets[key] ?? 0) + r.amount;
      }
    }

    const series = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }));

    return { metric, granularity, period: { startDate: start.toISOString(), endDate: end.toISOString() }, series };
  },
};
