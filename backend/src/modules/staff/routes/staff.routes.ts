import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { Routes } from '../../../shared/interfaces/routes.interface';
import { requireAdmin } from '../../auth/middlewares/rbac.middleware';
import { authenticate } from '../../auth/middlewares/auth.middleware';

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

        // Get single staff history
        this.router.get('/:id/history', authenticate, this.staffController.getStaffHistory);

        // Management routes
        this.router.put('/:id', authenticate, requireAdmin, this.staffController.updateStaff);
        this.router.patch('/:id/status', authenticate, requireAdmin, this.staffController.toggleStatus);
        this.router.delete('/:id', authenticate, requireAdmin, this.staffController.deleteStaff);
    }
}
