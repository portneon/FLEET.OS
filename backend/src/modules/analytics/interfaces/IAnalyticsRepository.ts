import { Transaction, Trip, Booking } from '@prisma/client';

export interface IAnalyticsRepository {
  getTransactions(organizationId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getTrips(organizationId: string, startDate?: Date, endDate?: Date): Promise<Trip[]>;
  getBookings(organizationId: string, startDate?: Date, endDate?: Date): Promise<Booking[]>;
}
