import { Trip, TripStatus } from '@prisma/client';

export interface CreateTripDTO {
    routeId: string;
    vehicleId: string;
    driverId: string;
    scheduledStart: Date;
    organizationId: string;
}

export interface ITripRepository {
    create(data: CreateTripDTO): Promise<Trip>;
    findById(id: string): Promise<Trip | null>;
    findAllByOrg(organizationId: string): Promise<Trip[]>;
    findActiveByOrg(organizationId: string): Promise<Trip[]>;
    updateStatus(id: string, status: TripStatus, timestamp?: Date): Promise<Trip>;
    bookTrip(data: CreateBookingDTO): Promise<any>;
}

export interface CreateBookingDTO {
    tripId: string;
    userId: string;
    amount: number;
    organizationId: string;
}
