import { Request, Response } from 'express';
import { ITripService } from '../interfaces/ITripService';

export class TripController {
    constructor(private tripService: ITripService) {}

    public scheduleTrip = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

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
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getTrips = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }
            const trips = await this.tripService.getTrips(orgId);
            res.status(200).json({ data: trips, message: 'Trips retrieved' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public getActiveTrips = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }
            const trips = await this.tripService.getActiveTrips(orgId);
            res.status(200).json({ data: trips, message: 'Active trips retrieved' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public getTripById = async (req: Request, res: Response): Promise<void> => {
        try {
            const trip = await this.tripService.getTripById(req.params.id);
            res.status(200).json({ data: trip });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public startTrip = async (req: Request, res: Response): Promise<void> => {
        try {
            const trip = await this.tripService.startTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip started' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public endTrip = async (req: Request, res: Response): Promise<void> => {
        try {
            const trip = await this.tripService.endTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip completed' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public cancelTrip = async (req: Request, res: Response): Promise<void> => {
        try {
            const trip = await this.tripService.cancelTrip(req.params.id);
            res.status(200).json({ data: trip, message: 'Trip cancelled' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
