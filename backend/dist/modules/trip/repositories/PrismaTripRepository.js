"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTripRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../prisma");
class PrismaTripRepository {
    async create(data) {
        return await prisma_1.prisma.trip.create({ data });
    }
    async findById(id) {
        return await prisma_1.prisma.trip.findUnique({
            where: { id },
            include: {
                route: { include: { stops: { include: { stop: true }, orderBy: { sequence: 'asc' } } } },
                vehicle: true,
                driver: { include: { user: true } }
            }
        });
    }
    async findAllByOrg(organizationId) {
        return await prisma_1.prisma.trip.findMany({
            where: { organizationId },
            include: {
                route: true,
                vehicle: true,
                driver: { include: { user: true } }
            },
            orderBy: { scheduledStart: 'asc' }
        });
    }
    async findActiveByOrg(organizationId) {
        return await prisma_1.prisma.trip.findMany({
            where: { organizationId, status: client_1.TripStatus.IN_PROGRESS },
            include: {
                route: true,
                vehicle: true,
                driver: { include: { user: true } }
            }
        });
    }
    async updateStatus(id, status, timestamp) {
        const data = { status };
        if (status === client_1.TripStatus.IN_PROGRESS)
            data.actualStart = timestamp ?? new Date();
        if (status === client_1.TripStatus.COMPLETED)
            data.actualEnd = timestamp ?? new Date();
        return await prisma_1.prisma.trip.update({ where: { id }, data });
    }
}
exports.PrismaTripRepository = PrismaTripRepository;
