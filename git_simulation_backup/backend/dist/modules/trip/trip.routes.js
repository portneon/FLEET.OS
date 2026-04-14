"use strict";
// src/modules/trip/trip.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class TripRoute {
    tripController;
    path = '/trips';
    router = (0, express_1.Router)();
    constructor(tripController) {
        this.tripController = tripController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Dispatcher: schedule and view trips
        this.router.post('/', auth_middleware_1.authenticate, this.tripController.scheduleTrip);
        this.router.get('/', auth_middleware_1.authenticate, this.tripController.getTrips);
        this.router.get('/active', auth_middleware_1.authenticate, this.tripController.getActiveTrips);
        this.router.get('/:id', auth_middleware_1.authenticate, this.tripController.getTripById);
        // Driver: transition trip status
        this.router.patch('/:id/start', auth_middleware_1.authenticate, this.tripController.startTrip);
        this.router.patch('/:id/end', auth_middleware_1.authenticate, this.tripController.endTrip);
        this.router.patch('/:id/cancel', auth_middleware_1.authenticate, this.tripController.cancelTrip);
    }
}
exports.TripRoute = TripRoute;
