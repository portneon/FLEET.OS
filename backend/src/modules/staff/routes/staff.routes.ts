import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { Routes } from '../../../shared/interfaces/routes.interface';
import { requireAdmin } from '../../../middlewares/rbac.middleware';
import { authenticate } from '../../../middlewares/auth.middleware';

export class StaffRoute implements Routes {
    public path = '/staff';
    public router = Router();

    constructor(public staffController: StaffController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Admin only route
        this.router.post('/register', authenticate, requireAdmin, this.staffController.registerStaff);

        // General staff login
        this.router.post('/login', this.staffController.loginStaff);

        // Admin gets all staff
        this.router.get('/', requireAdmin, this.staffController.getStaff);
    }
}
