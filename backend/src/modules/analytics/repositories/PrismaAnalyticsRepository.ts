import { prisma } from '../../../prisma';
import { IAnalyticsRepository } from '../interfaces/IAnalyticsRepository';
import { Transaction, Trip, Booking } from '@prisma/client';

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  async getTransactions(organizationId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        organizationId,
        ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {})
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getTrips(organizationId: string, startDate?: Date, endDate?: Date): Promise<Trip[]> {
    return prisma.trip.findMany({
      where: {
        organizationId,
        ...(startDate && endDate ? { scheduledStart: { gte: startDate, lte: endDate } } : {})
      },
      orderBy: { scheduledStart: 'asc' }
    });
  }

  async getBookings(organizationId: string, startDate?: Date, endDate?: Date): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: {
        organizationId,
        ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {})
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
