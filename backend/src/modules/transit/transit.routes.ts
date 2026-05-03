// src/modules/transit/transit.routes.ts

import { Router } from 'express';
import { TransitController } from './controllers/TransitController';
import { Routes } from '../../shared/interfaces/routes.interface';
import { authenticate } from '../auth/middlewares/auth.middleware';

export class TransitRoute implements Routes {
    public path = '/transit';
    public router = Router();

    constructor(public transitController: TransitController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Routes
        this.router.post('/routes', authenticate, this.transitController.createRoute);
        this.router.post('/routes/plan', authenticate, this.transitController.planRoute);
        this.router.get('/routes', authenticate, this.transitController.getRoutes);
        this.router.get('/routes/:id', authenticate, this.transitController.getRouteById);
        this.router.delete('/routes/:id', authenticate, this.transitController.deleteRoute);

        // Stops
        this.router.post('/stops', authenticate, this.transitController.createStop);
        this.router.get('/stops', authenticate, this.transitController.getStops);

        // Route-Stop linking
        this.router.post('/routes/:id/stops', authenticate, this.transitController.addStopToRoute);
        this.router.delete('/routes/:id/stops/:stopId', authenticate, this.transitController.removeStopFromRoute);
    }
}
