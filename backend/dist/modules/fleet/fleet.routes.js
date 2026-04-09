"use strict";
// src/modules/fleet/fleet.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PrismaVehicleRepository_1 = require("./repositories/PrismaVehicleRepository");
const VehicleService_1 = require("./services/VehicleService");
const VehicleController_1 = require("./controllers/VehicleController");
const router = (0, express_1.Router)();
// 1. Instantiate the Repository (Data Layer)
const vehicleRepo = new PrismaVehicleRepository_1.PrismaVehicleRepository();
// 2. Inject Repo into Service (Business Layer)
const vehicleService = new VehicleService_1.VehicleService(vehicleRepo);
// 3. Inject Service into Controller (Presentation Layer)
const vehicleController = new VehicleController_1.VehicleController(vehicleService);
// 4. Define Endpoints
router.post('/register', vehicleController.registerVehicle);
router.get('/', vehicleController.getFleet);
exports.default = router;
