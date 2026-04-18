import { IAnalyticsRepository } from '../interfaces/IAnalyticsRepository';
import { IAnalyticsService, AnalyticsReport, AnalyticsPeriod, ChartDataPoint } from '../interfaces/IAnalyticsService';
import { Transaction, Trip, Booking, TransactionType, TripStatus } from '@prisma/client';

export class AnalyticsService implements IAnalyticsService {
  constructor(private analyticsRepo: IAnalyticsRepository) {}

  async getReport(organizationId: string, period: AnalyticsPeriod, customStart?: string, customEnd?: string): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);

    // Fetch data
    const [transactions, trips, bookings] = await Promise.all([
       this.analyticsRepo.getTransactions(organizationId, startDate || undefined, endDate || undefined),
       this.analyticsRepo.getTrips(organizationId, startDate || undefined, endDate || undefined),
       this.analyticsRepo.getBookings(organizationId, startDate || undefined, endDate || undefined)
    ]);

    // Aggregate summary
    let totalRevenue = 0;
    let totalExpenses = 0;
    
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) totalRevenue += t.amount;
      if (t.type === TransactionType.EXPENSE) totalExpenses += t.amount;
    });

    const totalProfit = totalRevenue - totalExpenses;
    const totalTrips = trips.length;
    const totalPassengers = bookings.length;

    // Group for chart data
    const chartData = this.groupData(period, startDate, endDate, transactions, trips, bookings);

    return {
      period,
      startDate: startDate ? startDate.toISOString() : 'lifetime',
      endDate: endDate ? endDate.toISOString() : 'lifetime',
      summary: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        totalTrips,
        totalPassengers
      },
      chartData
    };
  }

  private getDateRange(period: AnalyticsPeriod, customStart?: string, customEnd?: string): { startDate: Date | null, endDate: Date | null } {
    const end = new Date();
    let start = new Date();
    
    // reset end of day for 'end'
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case 'daily':
        // Today
        break;
      case 'weekly':
        start.setDate(end.getDate() - 6); // Last 7 days
        break;
      case 'monthly':
        start.setDate(end.getDate() - 29); // Last 30 days
        break;
      case 'quarterly':
        start.setMonth(end.getMonth() - 3); // Last 3 months
        break;
      case 'yearly':
        start.setFullYear(end.getFullYear() - 1); // Last 1 year
        break;
      case 'lifetime':
        return { startDate: null, endDate: null };
      case 'custom':
        if (customStart && customEnd) {
          start = new Date(customStart);
          const endCustom = new Date(customEnd);
          endCustom.setHours(23, 59, 59, 999);
          return { startDate: start, endDate: endCustom };
        }
        break;
    }
    return { startDate: start, endDate: end };
  }

  private groupData(period: AnalyticsPeriod, startDate: Date | null, endDate: Date | null, transactions: Transaction[], trips: Trip[], bookings: Booking[]): ChartDataPoint[] {
    const buckets: { [key: string]: ChartDataPoint } = {};
    
    // We determine the key format based on the period.
    let formatKey = (d: Date) => d.toISOString().split('T')[0]; // Default YYYY-MM-DD
    
    if (period === 'daily') {
       formatKey = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:00`; 
       // Init 24 hours
       for(let i=0; i<24; i++) {
         const label = `${String(i).padStart(2, '0')}:00`;
         this.initBucket(buckets, label);
       }
    } else if (period === 'weekly' || period === 'monthly' || period === 'custom') {
       // Format YYYY-MM-DD
       if (startDate && endDate) {
         let curr = new Date(startDate);
         while (curr <= endDate) {
            this.initBucket(buckets, curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
         }
       }
    } else if (period === 'quarterly' || period === 'yearly') {
       formatKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
       if (startDate && endDate) {
         let curr = new Date(startDate);
         curr.setDate(1); // Set to 1st of month to avoid skipping months on 31st
         while(curr <= endDate) {
            this.initBucket(buckets, formatKey(curr));
            curr.setMonth(curr.getMonth() + 1);
         }
       }
    } else if (period === 'lifetime') {
       formatKey = (d: Date) => `${d.getFullYear()}`;
    }

    transactions.forEach(t => {
       const key = formatKey(t.createdAt);
       if (!buckets[key]) this.initBucket(buckets, key);
       
       if (t.type === TransactionType.INCOME) buckets[key].revenue += t.amount;
       if (t.type === TransactionType.EXPENSE) buckets[key].expenses += t.amount;
       buckets[key].profit = buckets[key].revenue - buckets[key].expenses;
    });

    trips.forEach(t => {
       const key = formatKey(t.scheduledStart);
       if (!buckets[key]) this.initBucket(buckets, key);
       
       buckets[key].totalTrips += 1;
       if (t.status === TripStatus.COMPLETED) buckets[key].completedTrips += 1;
    });

    bookings.forEach(b => {
       const key = formatKey(b.createdAt);
       if (!buckets[key]) this.initBucket(buckets, key);
       
       buckets[key].passengers += 1;
    });

    // Sort buckets by label lexicographically (works for YYYY-MM-DD, YYYY-MM, HH:00)
    return Object.values(buckets).sort((a,b) => a.label.localeCompare(b.label));
  }

  private initBucket(buckets: { [key: string]: ChartDataPoint }, key: string) {
      if(!buckets[key]) {
         buckets[key] = { label: key, revenue: 0, expenses: 0, profit: 0, totalTrips: 0, completedTrips: 0, passengers: 0 };
      }
  }
}
