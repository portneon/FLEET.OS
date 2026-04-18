import { Route, Stop, RouteStop } from '@prisma/client';
import { prisma } from '../../../prisma';
import {
    ITransitRepository,
    CreateRouteDTO,
    CreatePlannedRouteDTO,
    CreateStopDTO,
    AddStopToRouteDTO,
    RouteWithStops
} from '../interfaces/ITransitRepository';

export class PrismaTransitRepository implements ITransitRepository {

    async createRoute(data: CreateRouteDTO): Promise<Route> {
        return await prisma.route.create({ data });
    }

    async planRoute(data: CreatePlannedRouteDTO): Promise<RouteWithStops> {
        return await prisma.$transaction(async (tx) => {
            const route = await tx.route.create({
                data: {
                    name: data.name,
                    organizationId: data.organizationId
                }
            });

            const routeStops = [];
            for (let i = 0; i < data.stops.length; i++) {
                const stopData = data.stops[i];
                const stop = await tx.stop.create({
                    data: {
                        ...stopData,
                        organizationId: data.organizationId
                    }
                });

                const routeStop = await tx.routeStop.create({
                    data: {
                        routeId: route.id,
                        stopId: stop.id,
                        sequence: i + 1
                    },
                    include: { stop: true }
                });
                routeStops.push(routeStop);
            }

            return { ...route, stops: routeStops };
        });
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

    async shiftSequences(routeId: string, fromSequence: number, increment: number): Promise<void> {
        await prisma.routeStop.updateMany({
            where: {
                routeId,
                sequence: { gte: fromSequence }
            },
            data: {
                sequence: {
                    increment
                }
            }
        });
    }
}
