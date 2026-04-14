import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { Routes } from '../../../interfaces/routes.interface';
import { requireAdmin } from '../../../middlewares/rbac.middleware';

export class StaffRoute implements Routes {
    public path = '/staff';
    public router = Router();

    constructor(public staffController: StaffController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Admin only route
        this.router.post(`${this.path}/register`, requireAdmin, this.staffController.registerStaff);

        // General staff login
        this.router.post(`${this.path}/login`, this.staffController.loginStaff);

        // Admin gets all staff
        this.router.get(`${this.path}`, requireAdmin, this.staffController.getStaff);
    }
}
