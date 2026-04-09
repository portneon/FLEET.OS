// src/modules/fleet/fleet.routes.ts

import { Router } from 'express';
import { PrismaVehicleRepository } from './repositories/PrismaVehicleRepository';
import { VehicleService } from './services/VehicleService';
import { VehicleController } from './controllers/VehicleController';

const router = Router();

// 1. Instantiate the Repository (Data Layer)
const vehicleRepo = new PrismaVehicleRepository();

// 2. Inject Repo into Service (Business Layer)
const vehicleService = new VehicleService(vehicleRepo);

// 3. Inject Service into Controller (Presentation Layer)
const vehicleController = new VehicleController(vehicleService);

// 4. Define Endpoints
router.post('/register', vehicleController.registerVehicle);
router.get('/', vehicleController.getFleet);

export default router;