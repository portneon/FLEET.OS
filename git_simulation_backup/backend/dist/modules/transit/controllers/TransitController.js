"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitController = void 0;
class TransitController {
    transitService;
    constructor(transitService) {
        this.transitService = transitService;
    }
    // --- ROUTES ---
    createRoute = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const { name } = req.body;
            if (!name) {
                res.status(400).json({ error: 'Route name is required' });
                return;
            }
            const route = await this.transitService.createRoute({ name, organizationId: orgId });
            res.status(201).json({ data: route, message: 'Route created successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getRoutes = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const routes = await this.transitService.getRoutes(orgId);
            res.status(200).json({ data: routes, message: 'Routes retrieved' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getRouteById = async (req, res) => {
        try {
            const route = await this.transitService.getRouteById(req.params.id);
            res.status(200).json({ data: route });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    deleteRoute = async (req, res) => {
        try {
            await this.transitService.deleteRoute(req.params.id);
            res.status(200).json({ message: 'Route deleted successfully' });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    // --- STOPS ---
    createStop = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const { name, latitude, longitude } = req.body;
            if (!name || latitude == null || longitude == null) {
                res.status(400).json({ error: 'Stop name, latitude, and longitude are required' });
                return;
            }
            const stop = await this.transitService.createStop({
                name, latitude: parseFloat(latitude), longitude: parseFloat(longitude), organizationId: orgId
            });
            res.status(201).json({ data: stop, message: 'Stop created successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getStops = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }
            const stops = await this.transitService.getStops(orgId);
            res.status(200).json({ data: stops, message: 'Stops retrieved' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    // --- ROUTE-STOP LINKING ---
    addStopToRoute = async (req, res) => {
        try {
            const { stopId, sequence } = req.body;
            if (!stopId || sequence == null) {
                res.status(400).json({ error: 'stopId and sequence are required' });
                return;
            }
            const route = await this.transitService.addStopToRoute(req.params.id, stopId, parseInt(sequence));
            res.status(200).json({ data: route, message: 'Stop added to route' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    removeStopFromRoute = async (req, res) => {
        try {
            const route = await this.transitService.removeStopFromRoute(req.params.id, req.params.stopId);
            res.status(200).json({ data: route, message: 'Stop removed from route' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.TransitController = TransitController;
