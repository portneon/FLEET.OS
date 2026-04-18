import { Stop } from '@prisma/client';
import { CreateRouteDTO, CreateStopDTO, RouteWithStops, CreatePlannedRouteDTO } from './ITransitRepository';

export interface ITransitService {
    createRoute(data: CreateRouteDTO): Promise<RouteWithStops>;
    planRoute(data: CreatePlannedRouteDTO): Promise<RouteWithStops>;
    getRoutes(organizationId: string): Promise<RouteWithStops[]>;
    getRouteById(id: string): Promise<RouteWithStops>;
    deleteRoute(id: string): Promise<void>;

    createStop(data: CreateStopDTO): Promise<Stop>;
    getStops(organizationId: string): Promise<Stop[]>;

    addStopToRoute(routeId: string, stopId: string, sequence: number): Promise<RouteWithStops>;
    removeStopFromRoute(routeId: string, stopId: string): Promise<RouteWithStops>;
}
