import { Trip, TripStatus, DriverStatus } from '@prisma/client';
import { prisma } from '../../../prisma';
import { ITripRepository, CreateTripDTO } from '../interfaces/ITripRepository';

export class PrismaTripRepository implements ITripRepository {

    async create(data: CreateTripDTO): Promise<Trip> {
        return await prisma.trip.create({ data });
    }

    async findById(id: string): Promise<Trip | null> {
        return await prisma.trip.findUnique({
            where: { id },
            include: {
                route: { include: { stops: { include: { stop: true }, orderBy: { sequence: 'asc' } } } },
                vehicle: true,
                driver: { include: { user: true } },
                bookings: true
            } as any
        });
    }

    async findAllByOrg(organizationId: string): Promise<Trip[]> {
        return await prisma.trip.findMany({
            where: { organizationId },
            include: {
                route: true,
                vehicle: true,
                driver: { include: { user: true } }
            } as any,
            orderBy: { scheduledStart: 'asc' }
        });
    }

    async findActiveByOrg(organizationId: string): Promise<Trip[]> {
        return await prisma.trip.findMany({
            where: { organizationId, status: TripStatus.IN_PROGRESS },
            include: {
                route: true,
                vehicle: true,
                driver: { include: { user: true } }
            } as any
        });
    }

    async updateStatus(id: string, status: TripStatus, timestamp?: Date): Promise<Trip> {
        const data: any = { status };
        if (status === TripStatus.IN_PROGRESS) data.actualStart = timestamp ?? new Date();
        if (status === TripStatus.COMPLETED) data.actualEnd = timestamp ?? new Date();
        return await prisma.trip.update({ where: { id }, data });
    }

    async bookTrip(data: { tripId: string; userId: string; amount: number; organizationId: string }): Promise<any> {
        return await prisma.booking.create({ data });
    }
}
