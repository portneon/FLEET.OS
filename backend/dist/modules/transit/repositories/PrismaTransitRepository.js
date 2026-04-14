"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTransitRepository = void 0;
const prisma_1 = require("../../../prisma");
class PrismaTransitRepository {
    async createRoute(data) {
        return await prisma_1.prisma.route.create({ data });
    }
    async findRouteById(id) {
        return await prisma_1.prisma.route.findUnique({
            where: { id },
            include: {
                stops: {
                    include: { stop: true },
                    orderBy: { sequence: 'asc' }
                }
            }
        });
    }
    async findAllRoutes(organizationId) {
        return await prisma_1.prisma.route.findMany({
            where: { organizationId },
            include: {
                stops: {
                    include: { stop: true },
                    orderBy: { sequence: 'asc' }
                }
            }
        });
    }
    async deleteRoute(id) {
        await prisma_1.prisma.route.delete({ where: { id } });
    }
    async createStop(data) {
        return await prisma_1.prisma.stop.create({ data });
    }
    async findAllStops(organizationId) {
        return await prisma_1.prisma.stop.findMany({ where: { organizationId } });
    }
    async findStopById(id) {
        return await prisma_1.prisma.stop.findUnique({ where: { id } });
    }
    async addStopToRoute(data) {
        return await prisma_1.prisma.routeStop.create({ data });
    }
    async removeStopFromRoute(routeId, stopId) {
        await prisma_1.prisma.routeStop.deleteMany({ where: { routeId, stopId } });
    }
}
exports.PrismaTransitRepository = PrismaTransitRepository;
