"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../prisma");
class TripService {
    tripRepo;
    constructor(tripRepo) {
        this.tripRepo = tripRepo;
    }
    async scheduleTrip(data) {
        if (!data.routeId || !data.vehicleId || !data.driverId || !data.scheduledStart) {
            throw new Error('Route, vehicle, driver, and scheduled start time are required.');
        }
        return await this.tripRepo.create(data);
    }
    async startTrip(tripId) {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip)
            throw new Error('Trip not found.');
        if (trip.status !== client_1.TripStatus.SCHEDULED) {
            throw new Error(`Cannot start a trip with status: ${trip.status}.`);
        }
        // Mark driver as on trip
        await prisma_1.prisma.driverProfile.update({
            where: { id: trip.driverId },
            data: { status: client_1.DriverStatus.ON_TRIP }
        });
        return await this.tripRepo.updateStatus(tripId, client_1.TripStatus.IN_PROGRESS);
    }
    async endTrip(tripId) {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip)
            throw new Error('Trip not found.');
        if (trip.status !== client_1.TripStatus.IN_PROGRESS) {
            throw new Error(`Cannot end a trip with status: ${trip.status}.`);
        }
        // Mark driver as available again
        await prisma_1.prisma.driverProfile.update({
            where: { id: trip.driverId },
            data: { status: client_1.DriverStatus.AVAILABLE }
        });
        return await this.tripRepo.updateStatus(tripId, client_1.TripStatus.COMPLETED);
    }
    async cancelTrip(tripId) {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip)
            throw new Error('Trip not found.');
        if (trip.status === client_1.TripStatus.COMPLETED) {
            throw new Error('Cannot cancel a completed trip.');
        }
        if (trip.status === client_1.TripStatus.IN_PROGRESS) {
            await prisma_1.prisma.driverProfile.update({
                where: { id: trip.driverId },
                data: { status: client_1.DriverStatus.AVAILABLE }
            });
        }
        return await this.tripRepo.updateStatus(tripId, client_1.TripStatus.CANCELLED);
    }
    async getTrips(organizationId) {
        return await this.tripRepo.findAllByOrg(organizationId);
    }
    async getActiveTrips(organizationId) {
        return await this.tripRepo.findActiveByOrg(organizationId);
    }
    async getTripById(tripId) {
        const trip = await this.tripRepo.findById(tripId);
        if (!trip)
            throw new Error('Trip not found.');
        return trip;
    }
}
exports.TripService = TripService;
