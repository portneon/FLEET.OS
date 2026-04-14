"use strict";
// src/modules/fleet/fleet.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class FleetRoute {
    vehicleController;
    path = '/fleet';
    router = (0, express_1.Router)();
    constructor(vehicleController) {
        this.vehicleController = vehicleController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Register new vehicle
        this.router.post('/register', auth_middleware_1.authenticate, this.vehicleController.registerVehicle);
        // Get all vehicles in fleet
        this.router.get('/', this.vehicleController.getFleet);
    }
}
exports.FleetRoute = FleetRoute;
