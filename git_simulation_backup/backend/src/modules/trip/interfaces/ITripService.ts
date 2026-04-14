import { Trip } from '@prisma/client';
import { CreateTripDTO } from './ITripRepository';

export interface ITripService {
    scheduleTrip(data: CreateTripDTO): Promise<Trip>;
    startTrip(tripId: string): Promise<Trip>;
    endTrip(tripId: string): Promise<Trip>;
    cancelTrip(tripId: string): Promise<Trip>;
    getTrips(organizationId: string): Promise<Trip[]>;
    getActiveTrips(organizationId: string): Promise<Trip[]>;
    getTripById(tripId: string): Promise<Trip>;
}
