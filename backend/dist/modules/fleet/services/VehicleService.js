"use strict";
// src/modules/fleet/services/VehicleService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
class VehicleService {
    vehicleRepo;
    constructor(vehicleRepo) {
        this.vehicleRepo = vehicleRepo;
    }
    async registerVehicle(data) {
        if (data.vin.length !== 17) {
            throw new Error("Vehicle Identification Number must be exactly 17 characters.");
        }
        if (data.type === 'BUS') {
            if (!data.seatingCapacity || data.seatingCapacity <= 0) {
                throw new Error("Bus registration requires a valid seating capacity.");
            }
        }
        if (data.type !== 'BUS' && data.seatingCapacity) {
            data.seatingCapacity = null;
        }
        const existingVehicle = await this.vehicleRepo.findByVin(data.vin);
        if (existingVehicle) {
            throw new Error("A vehicle with this VIN is already registered in the system.");
        }
        return await this.vehicleRepo.create(data);
    }
    async getOrganizationFleet(orgId) {
        return await this.vehicleRepo.findByOrganization(orgId);
    }
    async updateVehicleStatus(vehicleId, status) {
        const validStatuses = ['IDLE', 'ACTIVE', 'MAINTENANCE'];
        if (!validStatuses.includes(status.toUpperCase())) {
            throw new Error("Invalid vehicle status.");
        }
        return await this.vehicleRepo.updateStatus(vehicleId, status.toUpperCase());
    }
}
exports.VehicleService = VehicleService;
