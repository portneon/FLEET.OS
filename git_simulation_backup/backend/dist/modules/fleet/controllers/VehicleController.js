"use strict";
// src/modules/fleet/controllers/VehicleController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
class VehicleController {
    vehicleService;
    constructor(vehicleService) {
        this.vehicleService = vehicleService;
    }
    registerVehicle = async (req, res) => {
        try {
            const { vin, type, licensePlate, seatingCapacity } = req.body;
            // In a real SaaS, organizationId comes from the JWT/Auth Middleware
            const organizationId = req.user?.organizationId || req.headers['x-organization-id'];
            if (!vin || !type || !licensePlate || !organizationId) {
                res.status(400).json({ error: 'VIN, Type, License Plate, and Organization ID are required' });
                return;
            }
            const vehicle = await this.vehicleService.registerVehicle({
                vin,
                type: type,
                licensePlate,
                seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
                organizationId
            });
            res.status(201).json({
                data: vehicle,
                message: `${type} successfully registered in fleet`
            });
        }
        catch (error) {
            // Handle specific domain errors thrown by the Service
            const status = error.message.includes('already registered') ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    };
    getFleet = async (req, res) => {
        try {
            const organizationId = req.user?.organizationId || req.headers['x-organization-id'];
            if (!organizationId) {
                res.status(403).json({ error: 'Organization context missing' });
                return;
            }
            const fleet = await this.vehicleService.getOrganizationFleet(organizationId);
            res.status(200).json({ data: fleet, message: 'Fleet retrieved successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to retrieve fleet data' });
        }
    };
}
exports.VehicleController = VehicleController;
