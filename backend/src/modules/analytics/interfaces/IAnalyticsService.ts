export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime' | 'custom';

export interface ChartDataPoint {
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  totalTrips: number;
  completedTrips: number;
  passengers: number;
}

export interface AnalyticsReport {
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalTrips: number;
    totalPassengers: number;
  };
  chartData: ChartDataPoint[];
}

export interface IAnalyticsService {
  getReport(
    organizationId: string,
    period: AnalyticsPeriod,
    customStart?: string,
    customEnd?: string
  ): Promise<AnalyticsReport>;
}
