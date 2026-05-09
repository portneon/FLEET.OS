import { PrismaClient, TransactionType } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

export const computeKPITool: AnalyticsTool = {
  name: 'computeKPI',
  description:
    'Compute a derived KPI such as profit margin, trip completion rate, cancellation rate, fleet utilization rate, or payment success rate.',
  domains: ['finance', 'fleet', 'trips', 'operations', 'general'],
  parameters: [
    {
      name: 'kpi',
      type: 'enum',
      required: true,
      description: 'Which KPI to compute',
      enumValues: [
        'profit_margin',
        'trip_completion_rate',
        'trip_cancellation_rate',
        'fleet_utilization_rate',
        'payment_success_rate',
        'invoice_paid_rate',
        'expense_ratio',
        'receivable_collection_rate',
      ],
    },
    { name: 'startDate', type: 'string', required: false, description: 'ISO start date' },
    { name: 'endDate', type: 'string', required: false, description: 'ISO end date' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { kpi, startDate, endDate } = params;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (kpi === 'profit_margin') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.createdAt = dateFilter;

      const [incomeRes, expenseRes] = await Promise.all([
        (prisma.transaction as any).aggregate({ _sum: { amount: true }, where: { ...where, type: TransactionType.INCOME } }),
        (prisma.transaction as any).aggregate({ _sum: { amount: true }, where: { ...where, type: TransactionType.EXPENSE } }),
      ]);
      const revenue = incomeRes._sum.amount ?? 0;
      const expenses = expenseRes._sum.amount ?? 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      return {
        kpi: 'profit_margin',
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitMargin: Math.round(margin * 100) / 100,
        unit: '%',
      };
    }

    if (kpi === 'trip_completion_rate' || kpi === 'trip_cancellation_rate') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.scheduledStart = dateFilter;

      const [total, completed, cancelled] = await Promise.all([
        (prisma.trip as any).count({ where }),
        (prisma.trip as any).count({ where: { ...where, status: 'COMPLETED' } }),
        (prisma.trip as any).count({ where: { ...where, status: 'CANCELLED' } }),
      ]);
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
      return {
        kpi,
        totalTrips: total,
        completedTrips: completed,
        cancelledTrips: cancelled,
        completionRate: Math.round(completionRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        unit: '%',
      };
    }

    if (kpi === 'fleet_utilization_rate') {
      const [totalVehicles, activeVehicles] = await Promise.all([
        (prisma.vehicle as any).count({ where: { organizationId: orgId } }),
        (prisma.vehicle as any).count({ where: { organizationId: orgId, status: { not: 'IDLE' } } }),
      ]);
      const rate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
      return {
        kpi: 'fleet_utilization_rate',
        totalVehicles,
        activeVehicles,
        utilizationRate: Math.round(rate * 100) / 100,
        unit: '%',
      };
    }

    if (kpi === 'payment_success_rate') {
      const where: any = {};
      if (Object.keys(dateFilter).length) where.paidAt = dateFilter;
      const [total, success] = await Promise.all([
        (prisma.payment as any).count({ where }),
        (prisma.payment as any).count({ where: { ...where, status: 'SUCCESS' } }),
      ]);
      const rate = total > 0 ? (success / total) * 100 : 0;
      return { kpi: 'payment_success_rate', totalPayments: total, successfulPayments: success, successRate: Math.round(rate * 100) / 100, unit: '%' };
    }

    if (kpi === 'invoice_paid_rate') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.issuedAt = dateFilter;
      const [total, paid] = await Promise.all([
        (prisma.invoice as any).count({ where }),
        (prisma.invoice as any).count({ where: { ...where, status: 'PAID' } }),
      ]);
      const rate = total > 0 ? (paid / total) * 100 : 0;
      return { kpi: 'invoice_paid_rate', totalInvoices: total, paidInvoices: paid, paidRate: Math.round(rate * 100) / 100, unit: '%' };
    }

    if (kpi === 'expense_ratio') {
      const where: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
      const incomeRes = await (prisma.transaction as any).aggregate({ _sum: { amount: true }, where: { ...where, type: TransactionType.INCOME } });
      const expWhere: any = { organizationId: orgId };
      if (Object.keys(dateFilter).length) expWhere.expenseDate = dateFilter;
      const expenseRes = await (prisma.expense as any).aggregate({ _sum: { amount: true }, where: expWhere });
      const revenue = incomeRes._sum.amount ?? 0;
      const expenses = expenseRes._sum.amount ?? 0;
      const ratio = revenue > 0 ? (expenses / revenue) * 100 : 0;
      return { kpi: 'expense_ratio', revenue: Math.round(revenue * 100) / 100, expenses: Math.round(expenses * 100) / 100, expenseRatio: Math.round(ratio * 100) / 100, unit: '%' };
    }

    if (kpi === 'receivable_collection_rate') {
      const where: any = { organizationId: orgId };
      const [total, paid] = await Promise.all([
        (prisma.receivable as any).aggregate({ _sum: { amountDue: true }, where }),
        (prisma.receivable as any).aggregate({ _sum: { amountDue: true }, where: { ...where, status: 'PAID' } }),
      ]);
      const totalAmt = total._sum.amountDue ?? 0;
      const paidAmt = paid._sum.amountDue ?? 0;
      const rate = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;
      return { kpi: 'receivable_collection_rate', totalReceivables: Math.round(totalAmt * 100) / 100, collected: Math.round(paidAmt * 100) / 100, collectionRate: Math.round(rate * 100) / 100, unit: '%' };
    }

    return { kpi, error: 'KPI not implemented' };
  },
};
