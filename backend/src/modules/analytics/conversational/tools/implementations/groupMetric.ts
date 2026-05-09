import { PrismaClient } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

export const groupMetricTool: AnalyticsTool = {
  name: 'groupMetric',
  description:
    'Group a metric by a dimension (e.g. revenue by month, expenses by category, trips by vehicle, maintenance cost by vehicle).',
  domains: ['finance', 'fleet', 'trips', 'drivers', 'customers', 'operations', 'general'],
  parameters: [
    {
      name: 'entity',
      type: 'enum',
      required: true,
      description: 'What entity to analyse',
      enumValues: ['expense', 'invoice', 'trip', 'booking', 'payroll', 'fuelLog', 'maintenanceLog'],
    },
    {
      name: 'groupBy',
      type: 'enum',
      required: true,
      description: 'Dimension to group by',
      enumValues: ['category', 'vehicle', 'driver', 'month', 'status', 'customerType', 'route'],
    },
    { name: 'startDate', type: 'string', required: false, description: 'ISO start date' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO end date' },
    { name: 'limit', type: 'number', required: false, description: 'Max groups to return (default 10)' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { entity, groupBy, startDate, endDate, limit = 10 } = params;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (entity === 'expense') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.expenseDate = dateFilter;

      if (groupBy === 'category') {
        const rows = await (prisma.expense as any).groupBy({
          by: ['category'],
          where,
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: Number(limit),
        });
        return rows.map((r: any) => ({
          label: r.category,
          total: Math.round((r._sum.amount ?? 0) * 100) / 100,
          count: r._count.id,
        }));
      }

      if (groupBy === 'vehicle') {
        const rows = await (prisma.expense as any).findMany({
          where: { ...where, vehicleId: { not: null } },
          include: { vehicle: { select: { type: true } } },
        });
        const map: Record<string, { vehicleId: string; type: string; total: number }> = {};
        for (const r of rows) {
          if (!r.vehicleId) continue;
          if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, type: r.vehicle?.type ?? 'UNKNOWN', total: 0 };
          map[r.vehicleId].total += r.amount;
        }
        return Object.values(map)
          .sort((a, b) => b.total - a.total)
          .slice(0, Number(limit))
          .map((v) => ({ ...v, total: Math.round(v.total * 100) / 100 }));
      }

      if (groupBy === 'month') {
        const rows = await (prisma.expense as any).findMany({ where });
        const map: Record<string, number> = {};
        for (const r of rows) {
          const key = r.expenseDate.toISOString().slice(0, 7);
          map[key] = (map[key] ?? 0) + r.amount;
        }
        return Object.entries(map)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(0, Number(limit))
          .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }));
      }
    }

    if (entity === 'invoice') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.issuedAt = dateFilter;

      if (groupBy === 'status') {
        const rows = await (prisma.invoice as any).groupBy({
          by: ['status'],
          where,
          _sum: { total: true },
          _count: { id: true },
        });
        return rows.map((r: any) => ({
          label: r.status,
          total: Math.round((r._sum.total ?? 0) * 100) / 100,
          count: r._count.id,
        }));
      }

      if (groupBy === 'month') {
        const rows = await (prisma.invoice as any).findMany({ where });
        const map: Record<string, number> = {};
        for (const r of rows) {
          const key = r.issuedAt.toISOString().slice(0, 7);
          map[key] = (map[key] ?? 0) + r.total;
        }
        return Object.entries(map)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(0, Number(limit))
          .map(([label, total]) => ({ label, total: Math.round(total * 100) / 100 }));
      }
    }

    if (entity === 'trip') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.scheduledStart = dateFilter;

      if (groupBy === 'status') {
        const rows = await (prisma.trip as any).groupBy({
          by: ['status'],
          where,
          _count: { id: true },
        });
        return rows.map((r: any) => ({ label: r.status, count: r._count.id }));
      }

      if (groupBy === 'vehicle') {
        const rows = await (prisma.trip as any).findMany({
          where,
          include: { vehicle: { select: { type: true } } },
        });
        const map: Record<string, { vehicleId: string; type: string; count: number }> = {};
        for (const r of rows) {
          if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, type: r.vehicle?.type ?? 'UNKNOWN', count: 0 };
          map[r.vehicleId].count++;
        }
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, Number(limit));
      }

      if (groupBy === 'route') {
        const rows = await (prisma.trip as any).findMany({
          where,
          include: { route: { select: { name: true } } },
        });
        const map: Record<string, { routeId: string; routeName: string; count: number }> = {};
        for (const r of rows) {
          if (!map[r.routeId]) map[r.routeId] = { routeId: r.routeId, routeName: r.route?.name ?? 'Unknown', count: 0 };
          map[r.routeId].count++;
        }
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, Number(limit));
      }
    }

    if (entity === 'payroll') {
      const rows = await (prisma.payroll as any).findMany({
        where: { driver: { user: { organizationId: orgId } } },
        include: { driver: { select: { id: true } } },
      });
      const map: Record<string, { driverId: string; total: number; count: number }> = {};
      for (const r of rows) {
        if (!map[r.driverId]) map[r.driverId] = { driverId: r.driverId, total: 0, count: 0 };
        map[r.driverId].total += r.netPay;
        map[r.driverId].count++;
      }
      return Object.values(map)
        .sort((a, b) => b.total - a.total)
        .slice(0, Number(limit))
        .map((v) => ({ ...v, total: Math.round(v.total * 100) / 100 }));
    }

    if (entity === 'maintenanceLog') {
      const rows = await (prisma.maintenanceLog as any).findMany({
        where: { vehicle: { organizationId: orgId } },
        include: { vehicle: { select: { type: true } } },
      });
      const map: Record<string, { vehicleId: string; type: string; total: number; count: number }> = {};
      for (const r of rows) {
        if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, type: r.vehicle?.type ?? 'UNKNOWN', total: 0, count: 0 };
        map[r.vehicleId].total += r.cost;
        map[r.vehicleId].count++;
      }
      return Object.values(map)
        .sort((a, b) => b.total - a.total)
        .slice(0, Number(limit))
        .map((v) => ({ ...v, total: Math.round(v.total * 100) / 100 }));
    }

    return [];
  },
};
