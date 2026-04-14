"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
// --- Auth Module ---
const auth_routes_1 = require("./modules/auth/auth.routes");
const AuthController_1 = require("./modules/auth/controllers/AuthController");
const AuthService_1 = require("./modules/auth/services/AuthService");
const UserRepository_1 = require("./modules/auth/repositories/UserRepository");
// --- Staff Module ---
const staff_routes_1 = require("./modules/staff/routes/staff.routes");
const staff_controller_1 = require("./modules/staff/controllers/staff.controller");
const StaffService_1 = require("./modules/staff/services/StaffService");
const PrismaDriverRepository_1 = require("./modules/staff/repositories/PrismaDriverRepository");
const role_service_1 = require("./modules/staff/services/role.service");
// --- Fleet Module ---
const fleet_routes_1 = require("./modules/fleet/fleet.routes");
const VehicleController_1 = require("./modules/fleet/controllers/VehicleController");
const VehicleService_1 = require("./modules/fleet/services/VehicleService");
const PrismaVehicleRepository_1 = require("./modules/fleet/repositories/PrismaVehicleRepository");
// --- Finance Module ---
const finance_routes_1 = require("./modules/finance/finance.routes");
const FinanceController_1 = require("./modules/finance/controllers/FinanceController");
const FinanceService_1 = require("./modules/finance/services/FinanceService");
const PrismaFinanceRepository_1 = require("./modules/finance/repositories/PrismaFinanceRepository");
// --- Transit Module ---
const transit_routes_1 = require("./modules/transit/transit.routes");
const TransitController_1 = require("./modules/transit/controllers/TransitController");
const TransitService_1 = require("./modules/transit/services/TransitService");
const PrismaTransitRepository_1 = require("./modules/transit/repositories/PrismaTransitRepository");
// --- Trip Module ---
const trip_routes_1 = require("./modules/trip/trip.routes");
const TripController_1 = require("./modules/trip/controllers/TripController");
const TripService_1 = require("./modules/trip/services/TripService");
const PrismaTripRepository_1 = require("./modules/trip/repositories/PrismaTripRepository");
// ============================================
// Dependency Injection — Composition Root
// ============================================
// 1. Auth
const userRepo = new UserRepository_1.UserRepository();
const authService = new AuthService_1.AuthService(userRepo);
const authController = new AuthController_1.AuthController(authService);
const authRoute = new auth_routes_1.AuthRoute(authController);
// 2. Staff
const driverRepo = new PrismaDriverRepository_1.PrismaDriverRepository();
const roleService = new role_service_1.RoleService();
const staffService = new StaffService_1.StaffService(userRepo, driverRepo);
const staffController = new staff_controller_1.StaffController(staffService, roleService);
const staffRoute = new staff_routes_1.StaffRoute(staffController);
// 3. Fleet
const vehicleRepo = new PrismaVehicleRepository_1.PrismaVehicleRepository();
const vehicleService = new VehicleService_1.VehicleService(vehicleRepo);
const vehicleController = new VehicleController_1.VehicleController(vehicleService);
const fleetRoute = new fleet_routes_1.FleetRoute(vehicleController);
// 4. Finance
const financeRepo = new PrismaFinanceRepository_1.PrismaFinanceRepository();
const financeService = new FinanceService_1.FinanceService(financeRepo);
const financeController = new FinanceController_1.FinanceController(financeService);
const financeRoute = new finance_routes_1.FinanceRoute(financeController);
// 5. Transit (Routes & Stops)
const transitRepo = new PrismaTransitRepository_1.PrismaTransitRepository();
const transitService = new TransitService_1.TransitService(transitRepo);
const transitController = new TransitController_1.TransitController(transitService);
const transitRoute = new transit_routes_1.TransitRoute(transitController);
// 6. Trip (Dispatch & Driver Workflows)
const tripRepo = new PrismaTripRepository_1.PrismaTripRepository();
const tripService = new TripService_1.TripService(tripRepo);
const tripController = new TripController_1.TripController(tripService);
const tripRoute = new trip_routes_1.TripRoute(tripController);
// ============================================
// App Bootstrap
// ============================================
const app = new app_1.App([
    authRoute,
    staffRoute,
    fleetRoute,
    financeRoute,
    transitRoute,
    tripRoute,
]);
app.listen();
