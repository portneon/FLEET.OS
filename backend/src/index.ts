import { App } from './app';

import authRouter from './modules/auth/auth.routes';
import fleetRouter from './modules/fleet/fleet.routes';

// For Staff, we still wire it up manually as their staff.routes doesn't export a default router yet
import { StaffRoute } from './modules/staff/routes/staff.routes';
import { StaffService } from './modules/staff/services/StaffService';
import { PrismaDriverRepository } from './modules/staff/repositories/PrismaDriverRepository';
import { RoleService } from './modules/staff/services/role.service';
import { StaffController } from './modules/staff/controllers/staff.controller';
import { UserRepository } from './modules/auth/repositories/UserRepository';

import financeRouter from './modules/finance/finance.routes';

// 1. Auth Module
const authRouteConfig = { router: authRouter, path: '/auth' };

// 2. Staff Module
const userRepo = new UserRepository();
const driverRepo = new PrismaDriverRepository();
const roleService = new RoleService();
const staffService = new StaffService(userRepo, driverRepo);
const staffController = new StaffController(staffService as any, roleService);
const staffRouteConfig = new StaffRoute(staffController);

// 3. Fleet Module
const fleetRouteConfig = { router: fleetRouter, path: '/fleet' };

// 4. Finance Module
const financeRouteConfig = { router: financeRouter, path: '/finance' };

const app = new App([
    authRouteConfig,
    staffRouteConfig,
    fleetRouteConfig,
    financeRouteConfig
]);

app.listen();
