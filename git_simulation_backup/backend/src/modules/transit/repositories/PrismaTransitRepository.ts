import { Route, Stop, RouteStop } from '@prisma/client';
import { prisma } from '../../../prisma';
import {
    ITransitRepository,
    CreateRouteDTO,
    CreateStopDTO,
    AddStopToRouteDTO,
    RouteWithStops
} from '../interfaces/ITransitRepository';

export class PrismaTransitRepository implements ITransitRepository {

    async createRoute(data: CreateRouteDTO): Promise<Route> {
        return await prisma.route.create({ data });
    }

    async findRouteById(id: string): Promise<RouteWithStops | null> {
        return await prisma.route.findUnique({
            where: { id },
            include: {
                stops: {
                    include: { stop: true },
                    orderBy: { sequence: 'asc' }
                }
            }
        });
    }

    async findAllRoutes(organizationId: string): Promise<RouteWithStops[]> {
        return await prisma.route.findMany({
            where: { organizationId },
            include: {
                stops: {
                    include: { stop: true },
                    orderBy: { sequence: 'asc' }
                }
            }
        });
    }

    async deleteRoute(id: string): Promise<void> {
        await prisma.route.delete({ where: { id } });
    }

    async createStop(data: CreateStopDTO): Promise<Stop> {
        return await prisma.stop.create({ data });
    }

    async findAllStops(organizationId: string): Promise<Stop[]> {
        return await prisma.stop.findMany({ where: { organizationId } });
    }

    async findStopById(id: string): Promise<Stop | null> {
        return await prisma.stop.findUnique({ where: { id } });
    }

    async addStopToRoute(data: AddStopToRouteDTO): Promise<RouteStop> {
        return await prisma.routeStop.create({ data });
    }

    async removeStopFromRoute(routeId: string, stopId: string): Promise<void> {
        await prisma.routeStop.deleteMany({ where: { routeId, stopId } });
    }
}
