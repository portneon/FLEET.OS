import { PrismaClient } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

export const statusDistributionTool: AnalyticsTool = {
  name: 'statusDistribution',
  description:
    'Show status breakdown for invoices, trips, bookings, receivables, or payables (e.g. how many invoices are PENDING vs PAID vs OVERDUE).',
  domains: ['finance', 'trips', 'operations', 'general'],
  parameters: [
    {
      name: 'entity',
      type: 'enum',
      required: true,
      description: 'Entity to analyse status for',
      enumValues: ['invoice', 'trip', 'booking', 'receivable', 'payable', 'payment'],
    },
    { name: 'startDate', type: 'string', required: false, description: 'ISO start date' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO end date' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { entity, startDate, endDate } = params;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (entity === 'invoice') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.issuedAt = dateFilter;
      const rows = await (prisma.invoice as any).groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { total: true },
      });
      return {
        entity: 'invoice',
        distribution: rows.map((r: any) => ({
          status: r.status,
          count: r._count.id,
          totalAmount: Math.round((r._sum.total ?? 0) * 100) / 100,
        })),
      };
    }

    if (entity === 'trip') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.scheduledStart = dateFilter;
      const rows = await (prisma.trip as any).groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      });
      return {
        entity: 'trip',
        distribution: rows.map((r: any) => ({ status: r.status, count: r._count.id })),
      };
    }

    if (entity === 'booking') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
      const rows = await (prisma.booking as any).groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      });
      return {
        entity: 'booking',
        distribution: rows.map((r: any) => ({ status: r.status, count: r._count.id })),
      };
    }

    if (entity === 'receivable') {
      const rows = await (prisma.receivable as any).groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: { id: true },
        _sum: { amountDue: true },
      });
      return {
        entity: 'receivable',
        distribution: rows.map((r: any) => ({
          status: r.status,
          count: r._count.id,
          totalAmount: Math.round((r._sum.amountDue ?? 0) * 100) / 100,
        })),
      };
    }

    if (entity === 'payable') {
      const rows = await (prisma.payable as any).groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: { id: true },
        _sum: { amount: true },
      });
      return {
        entity: 'payable',
        distribution: rows.map((r: any) => ({
          status: r.status,
          count: r._count.id,
          totalAmount: Math.round((r._sum.amount ?? 0) * 100) / 100,
        })),
      };
    }

    if (entity === 'payment') {
      const rows = await (prisma.payment as any).groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      });
      return {
        entity: 'payment',
        distribution: rows.map((r: any) => ({
          status: r.status,
          count: r._count.id,
          totalAmount: Math.round((r._sum.amount ?? 0) * 100) / 100,
        })),
      };
    }

    return { entity, distribution: [] };
  },
};
