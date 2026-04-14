// src/modules/fleet/fleet.routes.ts

import { Router } from 'express';
import { PrismaVehicleRepository } from './repositories/PrismaVehicleRepository';
import { VehicleService } from './services/VehicleService';
import { VehicleController } from './controllers/VehicleController';
import { Routes } from '../../interfaces/routes.interface';

export class FleetRoute implements Routes {
    public path = '/fleet';
    public router = Router();

    constructor(public vehicleController: VehicleController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Register new vehicle
        this.router.post(`${this.path}/register`, this.vehicleController.registerVehicle);

        // Get all vehicles in fleet
        this.router.get(`${this.path}`, this.vehicleController.getFleet);
    }
}

// Export default router for backward compatibility if needed
const vehicleRepo = new PrismaVehicleRepository();
const vehicleService = new VehicleService(vehicleRepo);
const vehicleController = new VehicleController(vehicleService);

export default new FleetRoute(vehicleController).router;