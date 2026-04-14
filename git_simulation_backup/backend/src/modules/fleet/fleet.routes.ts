// src/modules/fleet/fleet.routes.ts

import { Router } from 'express';
import { VehicleController } from './controllers/VehicleController';
import { Routes } from '../../shared/interfaces/routes.interface';
import { authenticate } from '../../middlewares/auth.middleware';

export class FleetRoute implements Routes {
    public path = '/fleet';
    public router = Router();

    constructor(public vehicleController: VehicleController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Register new vehicle
        this.router.post('/register', authenticate, this.vehicleController.registerVehicle);

        // Get all vehicles in fleet
        this.router.get('/', this.vehicleController.getFleet);
    }
}