import { Trip, TripStatus, DriverStatus } from '@prisma/client';
import { ITripRepository, CreateTripDTO } from '../interfaces/ITripRepository';
import { ITripService } from '../interfaces/ITripService';
import { prisma } from '../../../prisma';

export class TripService implements ITripService {
    constructor(private tripRepo: ITripRepository) {}

    async scheduleTrip(data: CreateTripDTO): Promise<Trip> {
        if (!data.routeId || !data.vehicleId || !data.driverId || !data.scheduledStart) {
            throw new Error('Route, vehicle, driver, and scheduled start time are required.');
        }
        return await this.tripRepo.create(data);
    }

    async startTrip(tripId: string): Promise<Trip> {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip) throw new Error('Trip not found.');
        if (trip.status !== TripStatus.SCHEDULED) {
            throw new Error(`Cannot start a trip with status: ${trip.status}.`);
        }
        // Mark driver as on trip
        await prisma.driverProfile.update({
            where: { id: trip.driverId },
            data: { status: DriverStatus.ON_TRIP }
        });
        return await this.tripRepo.updateStatus(tripId, TripStatus.IN_PROGRESS);
    }

    async endTrip(tripId: string): Promise<Trip> {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip) throw new Error('Trip not found.');
        if (trip.status !== TripStatus.IN_PROGRESS) {
            throw new Error(`Cannot end a trip with status: ${trip.status}.`);
        }
        // Mark driver as available again
        await prisma.driverProfile.update({
            where: { id: trip.driverId },
            data: { status: DriverStatus.AVAILABLE }
        });
        return await this.tripRepo.updateStatus(tripId, TripStatus.COMPLETED);
    }

    async cancelTrip(tripId: string): Promise<Trip> {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip) throw new Error('Trip not found.');
        if (trip.status === TripStatus.COMPLETED) {
            throw new Error('Cannot cancel a completed trip.');
        }
        if (trip.status === TripStatus.IN_PROGRESS) {
            await prisma.driverProfile.update({
                where: { id: trip.driverId },
                data: { status: DriverStatus.AVAILABLE }
            });
        }
        return await this.tripRepo.updateStatus(tripId, TripStatus.CANCELLED);
    }

    async getTrips(organizationId: string): Promise<Trip[]> {
        return await this.tripRepo.findAllByOrg(organizationId);
    }

    async getActiveTrips(organizationId: string): Promise<Trip[]> {
        return await this.tripRepo.findActiveByOrg(organizationId);
    }

    async getTripById(tripId: string): Promise<Trip> {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip) throw new Error('Trip not found.');
        return trip;
    }

    async bookTrip(data: { tripId: string; userId: string; amount: number; organizationId: string }): Promise<any> {
        const trip = await this.tripRepo.findById(data.tripId);
        if (!trip) throw new Error('Trip not found.');
        if (trip.status !== TripStatus.SCHEDULED && trip.status !== TripStatus.IN_PROGRESS) {
            throw new Error('Cannot book a trip that is completed or cancelled.');
        }
        return await this.tripRepo.bookTrip(data);
    }
}
