"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripController = void 0;
class TripController {
    tripService;
    constructor(tripService) {
        this.tripService = tripService;
    }
    scheduleTrip = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const { routeId, vehicleId, driverId, scheduledStart } = req.body;
            if (!routeId || !vehicleId || !driverId || !scheduledStart) {
                res.status(400).json({ error: 'routeId, vehicleId, driverId, and scheduledStart are required' });
                return;
            }
            const trip = await this.tripService.scheduleTrip({
                routeId, vehicleId, driverId, organizationId: orgId,
                scheduledStart: new Date(scheduledStart)
            });
            res.status(201).json({ data: trip, message: 'Trip scheduled successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getTrips = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const trips = await this.tripService.getTrips(orgId);
            res.status(200).json({ data: trips, message: 'Trips retrieved' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getActiveTrips = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const trips = await this.tripService.getActiveTrips(orgId);
            res.status(200).json({ data: trips, message: 'Active trips retrieved' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getTripById = async (req, res) => {
        try {
            const trip = await this.tripService.getTripById(req.params.id);
            res.status(200).json({ data: trip });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    startTrip = async (req, res) => {
        try {
            const trip = await this.tripService.startTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip started' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    endTrip = async (req, res) => {
        try {
            const trip = await this.tripService.endTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip completed' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    cancelTrip = async (req, res) => {
        try {
            const trip = await this.tripService.cancelTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip cancelled' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.TripController = TripController;
