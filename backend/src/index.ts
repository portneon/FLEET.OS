import { App } from './app';
import { AuthRoute } from './routes/user.routes';
import { StaffRoute } from './routes/staff.routes';
import { AuthService } from './modules/auth/services/AuthService';
import { UserRepository } from './modules/auth/repositories/UserRepository';
import { StaffService } from './modules/staff/services/StaffService';
import { PrismaDriverRepository } from './modules/staff/repositories/PrismaDriverRepository';
import { RoleService } from './services/role.service';
import { AuthController } from './modules/auth/controllers/AuthController';
import { StaffController } from './controllers/staff.controller';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);
const authRoute = new AuthRoute(authController);

const driverRepo = new PrismaDriverRepository();
const roleService = new RoleService();
const staffService = new StaffService(userRepo, driverRepo);
const staffController = new StaffController(staffService, roleService);
const staffRoute = new StaffRoute(staffController);

const app = new App([
    authRoute,
    staffRoute,
]);

app.listen();
