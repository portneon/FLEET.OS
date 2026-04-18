import { Route, Stop, RouteStop } from '@prisma/client';

export interface CreateRouteDTO {
    name: string;
    organizationId: string;
}

export interface CreateStopDTO {
    name: string;
    latitude: number;
    longitude: number;
    organizationId: string;
}

export interface AddStopToRouteDTO {
    routeId: string;
    stopId: string;
    sequence: number;
}

export type RouteWithStops = Route & {
    stops: (RouteStop & { stop: Stop })[];
};

export interface CreatePlannedRouteDTO {
    name: string;
    organizationId: string;
    stops: {
        name: string;
        latitude: number;
        longitude: number;
    }[];
}

export interface ITransitRepository {
    createRoute(data: CreateRouteDTO): Promise<Route>;
    planRoute(data: CreatePlannedRouteDTO): Promise<RouteWithStops>;
    findRouteById(id: string): Promise<RouteWithStops | null>;
    findAllRoutes(organizationId: string): Promise<RouteWithStops[]>;
    deleteRoute(id: string): Promise<void>;

    createStop(data: CreateStopDTO): Promise<Stop>;
    findAllStops(organizationId: string): Promise<Stop[]>;
    findStopById(id: string): Promise<Stop | null>;

    addStopToRoute(data: AddStopToRouteDTO): Promise<RouteStop>;
    removeStopFromRoute(routeId: string, stopId: string): Promise<void>;
    shiftSequences(routeId: string, fromSequence: number, increment: number): Promise<void>;
}
