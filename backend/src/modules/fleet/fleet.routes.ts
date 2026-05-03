
import { Router } from 'express';
import { VehicleController } from './controllers/VehicleController';
import { Routes } from '../../shared/interfaces/routes.interface';
import { authenticate } from '../auth/middlewares/auth.middleware';

export class FleetRoute implements Routes {
    public path = '/fleet';
    public router = Router();

    constructor(public vehicleController: VehicleController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post('/register', authenticate, this.vehicleController.registerVehicle);

    
        this.router.get('/', authenticate, this.vehicleController.getFleet);


        this.router.get('/:id/history', authenticate, this.vehicleController.getVehicleHistory);
    }
}