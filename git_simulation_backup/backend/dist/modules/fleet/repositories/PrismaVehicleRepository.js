"use strict";
// src/modules/fleet/repositories/PrismaVehicleRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaVehicleRepository = void 0;
const prisma_1 = require("../../../prisma");
class PrismaVehicleRepository {
    async create(data) {
        return await prisma_1.prisma.vehicle.create({
            data: {
                vin: data.vin,
                type: data.type,
                licensePlate: data.licensePlate,
                seatingCapacity: data.seatingCapacity,
                organizationId: data.organizationId,
                status: data.status || 'IDLE'
            }
        });
    }
    async findByVin(vin) {
        return await prisma_1.prisma.vehicle.findUnique({ where: { vin } });
    }
    async findByOrganization(organizationId) {
        return await prisma_1.prisma.vehicle.findMany({
            where: { organizationId }
        });
    }
    async findById(id) {
        return await prisma_1.prisma.vehicle.findUnique({ where: { id } });
    }
    async updateStatus(id, status) {
        return await prisma_1.prisma.vehicle.update({
            where: { id },
            data: { status }
        });
    }
    async delete(id) {
        await prisma_1.prisma.vehicle.delete({ where: { id } });
    }
}
exports.PrismaVehicleRepository = PrismaVehicleRepository;
