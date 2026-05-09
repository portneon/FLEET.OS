import { PrismaClient } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

export const rankEntitiesTool: AnalyticsTool = {
  name: 'rankEntities',
  description:
    'Rank entities by a metric (e.g. top 5 vehicles by maintenance cost, top 10 drivers by trips completed, top customers by invoice value).',
  domains: ['fleet', 'drivers', 'customers', 'finance', 'general'],
  parameters: [
    {
      name: 'entity',
      type: 'enum',
      required: true,
      description: 'Entity to rank',
      enumValues: ['vehicle', 'driver', 'customer', 'route'],
    },
    {
      name: 'metric',
      type: 'enum',
      required: true,
      description: 'Metric to rank by',
      enumValues: ['maintenance_cost', 'fuel_cost', 'expense_total', 'trips_count', 'invoice_total', 'trip_count'],
    },
    {
      name: 'order',
      type: 'enum',
      required: false,
      description: 'Sort order: top (highest first) or bottom (lowest first)',
      enumValues: ['top', 'bottom'],
    },
    { name: 'limit', type: 'number', required: false, description: 'Number of results (default 5, max 20)' },
    { name: 'startDate', type: 'string', required: false, description: 'ISO start date' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO end date' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { entity, metric, order = 'top', limit = 5, startDate, endDate } = params;
    const take = Math.min(Number(limit), 20);

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (entity === 'vehicle') {
      if (metric === 'maintenance_cost') {
        const rows = await (prisma.maintenanceLog as any).findMany({
          where: {
            vehicle: { organizationId: orgId },
            ...(Object.keys(dateFilter).length ? { servicedAt: dateFilter } : {}),
          },
          include: { vehicle: { select: { type: true } } },
        });
        const map: Record<string, { vehicleId: string; type: string; total: number; count: number }> = {};
        for (const r of rows) {
          if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, type: r.vehicle?.type ?? 'UNKNOWN', total: 0, count: 0 };
          map[r.vehicleId].total += r.cost;
          map[r.vehicleId].count++;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.total - a.total : a.total - b.total)
          .slice(0, take)
          .map((v, i) => ({ rank: i + 1, ...v, total: Math.round(v.total * 100) / 100 }));
      }

      if (metric === 'fuel_cost') {
        const rows = await (prisma.fuelLog as any).findMany({
          where: {
            vehicle: { organizationId: orgId },
            ...(Object.keys(dateFilter).length ? { filledAt: dateFilter } : {}),
          },
          include: { vehicle: { select: { type: true } } },
        });
        const map: Record<string, { vehicleId: string; type: string; totalCost: number; totalLiters: number }> = {};
        for (const r of rows) {
          if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, type: r.vehicle?.type ?? 'UNKNOWN', totalCost: 0, totalLiters: 0 };
          map[r.vehicleId].totalCost += r.cost;
          map[r.vehicleId].totalLiters += r.liters;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.totalCost - a.totalCost : a.totalCost - b.totalCost)
          .slice(0, take)
          .map((v, i) => ({
            rank: i + 1,
            ...v,
            totalCost: Math.round(v.totalCost * 100) / 100,
            totalLiters: Math.round(v.totalLiters * 100) / 100,
          }));
      }

      if (metric === 'trips_count' || metric === 'trip_count') {
        const rows = await (prisma.trip as any).findMany({
          where: {
            organizationId: orgId,
            ...(Object.keys(dateFilter).length ? { scheduledStart: dateFilter } : {}),
          },
        });
        const map: Record<string, { vehicleId: string; count: number }> = {};
        for (const r of rows) {
          if (!map[r.vehicleId]) map[r.vehicleId] = { vehicleId: r.vehicleId, count: 0 };
          map[r.vehicleId].count++;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.count - a.count : a.count - b.count)
          .slice(0, take)
          .map((v, i) => ({ rank: i + 1, ...v }));
      }
    }

    if (entity === 'driver') {
      if (metric === 'trips_count' || metric === 'trip_count') {
        const rows = await (prisma.trip as any).findMany({
          where: {
            organizationId: orgId,
            ...(Object.keys(dateFilter).length ? { scheduledStart: dateFilter } : {}),
          },
        });
        const map: Record<string, { driverId: string; count: number }> = {};
        for (const r of rows) {
          if (!map[r.driverId]) map[r.driverId] = { driverId: r.driverId, count: 0 };
          map[r.driverId].count++;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.count - a.count : a.count - b.count)
          .slice(0, take)
          .map((v, i) => ({ rank: i + 1, ...v }));
      }
    }

    if (entity === 'customer') {
      if (metric === 'invoice_total') {
        const rows = await (prisma.invoice as any).findMany({
          where: {
            organizationId: orgId,
            ...(Object.keys(dateFilter).length ? { issuedAt: dateFilter } : {}),
          },
          include: { customer: { select: { name: true, customerType: true } } },
        });
        const map: Record<string, { customerId: string; name: string; type: string; total: number; count: number }> = {};
        for (const r of rows) {
          if (!map[r.customerId]) map[r.customerId] = {
            customerId: r.customerId,
            name: r.customer?.name ?? 'Unknown',
            type: r.customer?.customerType ?? 'UNKNOWN',
            total: 0,
            count: 0,
          };
          map[r.customerId].total += r.total;
          map[r.customerId].count++;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.total - a.total : a.total - b.total)
          .slice(0, take)
          .map((v, i) => ({ rank: i + 1, ...v, total: Math.round(v.total * 100) / 100 }));
      }
    }

    if (entity === 'route') {
      if (metric === 'trips_count' || metric === 'trip_count') {
        const rows = await (prisma.trip as any).findMany({
          where: {
            organizationId: orgId,
            ...(Object.keys(dateFilter).length ? { scheduledStart: dateFilter } : {}),
          },
          include: { route: { select: { name: true } } },
        });
        const map: Record<string, { routeId: string; routeName: string; count: number }> = {};
        for (const r of rows) {
          if (!map[r.routeId]) map[r.routeId] = { routeId: r.routeId, routeName: r.route?.name ?? 'Unknown', count: 0 };
          map[r.routeId].count++;
        }
        return Object.values(map)
          .sort((a, b) => order === 'top' ? b.count - a.count : a.count - b.count)
          .slice(0, take)
          .map((v, i) => ({ rank: i + 1, ...v }));
      }
    }

    return [];
  },
};
