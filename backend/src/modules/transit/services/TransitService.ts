import { Stop } from '@prisma/client';
import { ITransitRepository, CreateRouteDTO, CreateStopDTO, RouteWithStops } from '../interfaces/ITransitRepository';
import { ITransitService } from '../interfaces/ITransitService';

export class TransitService implements ITransitService {
    constructor(private transitRepo: ITransitRepository) {}

    async createRoute(data: CreateRouteDTO): Promise<RouteWithStops> {
        if (!data.name || !data.organizationId) {
            throw new Error('Route name and organization ID are required.');
        }
        const route = await this.transitRepo.createRoute(data);
        // Return with empty stops array
        return { ...route, stops: [] };
    }

    async getRoutes(organizationId: string): Promise<RouteWithStops[]> {
        return await this.transitRepo.findAllRoutes(organizationId);
    }

    async getRouteById(id: string): Promise<RouteWithStops> {
        const route = await this.transitRepo.findRouteById(id);
        if (!route) throw new Error(`Route with ID ${id} not found.`);
        return route;
    }

    async deleteRoute(id: string): Promise<void> {
        await this.getRouteById(id); // throws if not found
        await this.transitRepo.deleteRoute(id);
    }

    async createStop(data: CreateStopDTO): Promise<Stop> {
        if (!data.name || data.latitude == null || data.longitude == null) {
            throw new Error('Stop name, latitude, and longitude are required.');
        }
        if (data.latitude < -90 || data.latitude > 90) throw new Error('Invalid latitude.');
        if (data.longitude < -180 || data.longitude > 180) throw new Error('Invalid longitude.');
        return await this.transitRepo.createStop(data);
    }

    async getStops(organizationId: string): Promise<Stop[]> {
        return await this.transitRepo.findAllStops(organizationId);
    }

    async addStopToRoute(routeId: string, stopId: string, sequence: number): Promise<RouteWithStops> {
        const route = await this.transitRepo.findRouteById(routeId);
        if (!route) throw new Error(`Route with ID ${routeId} not found.`);
        const stop = await this.transitRepo.findStopById(stopId);
        if (!stop) throw new Error(`Stop with ID ${stopId} not found.`);
        if (sequence < 1) throw new Error('Sequence must be a positive integer.');

        await this.transitRepo.addStopToRoute({ routeId, stopId, sequence });
        return await this.getRouteById(routeId);
    }

    async removeStopFromRoute(routeId: string, stopId: string): Promise<RouteWithStops> {
        await this.getRouteById(routeId);
        await this.transitRepo.removeStopFromRoute(routeId, stopId);
        return await this.getRouteById(routeId);
    }
}
