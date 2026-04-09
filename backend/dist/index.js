"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const user_routes_1 = require("./routes/user.routes");
const staff_routes_1 = require("./routes/staff.routes");
const AuthService_1 = require("./modules/auth/services/AuthService");
const staff_service_1 = require("./services/staff.service");
const role_service_1 = require("./services/role.service");
const AuthController_1 = require("./modules/auth/controllers/AuthController");
const staff_controller_1 = require("./controllers/staff.controller");
const authService = new AuthService_1.AuthService();
const authController = new AuthController_1.AuthController(authService);
const authRoute = new user_routes_1.AuthRoute(authController);
const roleService = new role_service_1.RoleService();
const staffService = new staff_service_1.StaffService();
const staffController = new staff_controller_1.StaffController(staffService, roleService);
const staffRoute = new staff_routes_1.StaffRoute(staffController);
const app = new app_1.App([
    authRoute,
    staffRoute,
]);
app.listen();
