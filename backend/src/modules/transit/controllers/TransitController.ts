import { Request, Response } from 'express';
import { ITransitService } from '../interfaces/ITransitService';

export class TransitController {
    constructor(private transitService: ITransitService) {}

    // --- ROUTES ---

    public createRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { name } = req.body;
            if (!name) { res.status(400).json({ error: 'Route name is required' }); return; }

            const route = await this.transitService.createRoute({ name, organizationId: orgId });
            res.status(201).json({ data: route, message: 'Route created successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public planRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { name, stops } = req.body;
            if (!name || !stops || !Array.isArray(stops) || stops.length < 2) {
                res.status(400).json({ error: 'Route name and at least two stops (start and end) are required' });
                return;
            }

            const route = await this.transitService.planRoute({ name, organizationId: orgId, stops });
            res.status(201).json({ data: route, message: 'Route planned successfully from A to B' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public getRoutes = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }
            const routes = await this.transitService.getRoutes(orgId);
            res.status(200).json({ data: routes, message: 'Routes retrieved' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public getRouteById = async (req: Request, res: Response): Promise<void> => {
        try {
            const route = await this.transitService.getRouteById(req.params.id);
            res.status(200).json({ data: route });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    public deleteRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.transitService.deleteRoute(req.params.id);
            res.status(200).json({ message: 'Route deleted successfully' });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    };

    // --- STOPS ---

    public createStop = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }

            const { name, latitude, longitude } = req.body;
            if (!name || latitude == null || longitude == null) {
                res.status(400).json({ error: 'Stop name, latitude, and longitude are required' }); return;
            }

            const stop = await this.transitService.createStop({
                name, latitude: parseFloat(latitude), longitude: parseFloat(longitude), organizationId: orgId
            });
            res.status(201).json({ data: stop, message: 'Stop created successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public getStops = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) { res.status(400).json({ error: 'Organization ID is required' }); return; }
            const stops = await this.transitService.getStops(orgId);
            res.status(200).json({ data: stops, message: 'Stops retrieved' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

   

    public addStopToRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const { stopId, sequence } = req.body;
            if (!stopId || sequence == null) {
                res.status(400).json({ error: 'stopId and sequence are required' }); return;
            }
            const route = await this.transitService.addStopToRoute(req.params.id, stopId, parseInt(sequence));
            res.status(200).json({ data: route, message: 'Stop added to route' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public removeStopFromRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const route = await this.transitService.removeStopFromRoute(req.params.id, req.params.stopId);
            res.status(200).json({ data: route, message: 'Stop removed from route' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
