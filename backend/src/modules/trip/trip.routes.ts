// src/modules/trip/trip.routes.ts

import { Router } from 'express';
import { TripController } from './controllers/TripController';
import { Routes } from '../../shared/interfaces/routes.interface';
import { authenticate } from '../../middlewares/auth.middleware';

export class TripRoute implements Routes {
    public path = '/trips';
    public router = Router();

    constructor(public tripController: TripController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Dispatcher: schedule and view trips
        this.router.post('/', authenticate, this.tripController.scheduleTrip);
        this.router.get('/', authenticate, this.tripController.getTrips);
        this.router.get('/active', authenticate, this.tripController.getActiveTrips);
        this.router.get('/:id', authenticate, this.tripController.getTripById);

        // Driver: transition trip status
        this.router.patch('/:id/start', authenticate, this.tripController.startTrip);
        this.router.patch('/:id/end', authenticate, this.tripController.endTrip);
        this.router.patch('/:id/cancel', authenticate, this.tripController.cancelTrip);

        // Passengers: Book trip
        this.router.post('/:id/book', authenticate, this.tripController.bookTrip);
    }
}
