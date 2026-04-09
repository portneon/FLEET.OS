"use strict";
// src/modules/fleet/repositories/PrismaVehicleRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaVehicleRepository = void 0;
const client_1 = require("@prisma/client");
class PrismaVehicleRepository {
    prisma = new client_1.PrismaClient();
    async create(data) {
        return await this.prisma.vehicle.create({
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
        return await this.prisma.vehicle.findUnique({ where: { vin } });
    }
    async findByOrganization(organizationId) {
        return await this.prisma.vehicle.findMany({
            where: { organizationId }
        });
    }
    async findById(id) {
        return await this.prisma.vehicle.findUnique({ where: { id } });
    }
    async updateStatus(id, status) {
        return await this.prisma.vehicle.update({
            where: { id },
            data: { status }
        });
    }
    async delete(id) {
        await this.prisma.vehicle.delete({ where: { id } });
    }
}
exports.PrismaVehicleRepository = PrismaVehicleRepository;
