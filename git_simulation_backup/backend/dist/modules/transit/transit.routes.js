"use strict";
// src/modules/transit/transit.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class TransitRoute {
    transitController;
    path = '/transit';
    router = (0, express_1.Router)();
    constructor(transitController) {
        this.transitController = transitController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Routes
        this.router.post('/routes', auth_middleware_1.authenticate, this.transitController.createRoute);
        this.router.get('/routes', auth_middleware_1.authenticate, this.transitController.getRoutes);
        this.router.get('/routes/:id', auth_middleware_1.authenticate, this.transitController.getRouteById);
        this.router.delete('/routes/:id', auth_middleware_1.authenticate, this.transitController.deleteRoute);
        // Stops
        this.router.post('/stops', auth_middleware_1.authenticate, this.transitController.createStop);
        this.router.get('/stops', auth_middleware_1.authenticate, this.transitController.getStops);
        // Route-Stop linking
        this.router.post('/routes/:id/stops', auth_middleware_1.authenticate, this.transitController.addStopToRoute);
        this.router.delete('/routes/:id/stops/:stopId', auth_middleware_1.authenticate, this.transitController.removeStopFromRoute);
    }
}
exports.TransitRoute = TransitRoute;
