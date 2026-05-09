import { App } from './app';

// --- Auth Module ---
import { AuthRoute } from './modules/auth/routes/auth.routes';
import { AuthController } from './modules/auth/controllers/AuthController';
import { AuthService } from './modules/auth/services/AuthService';
import { UserRepository } from './modules/auth/repositories/UserRepository';

// --- Staff Module ---
import { StaffRoute } from './modules/staff/routes/staff.routes';
import { StaffController } from './modules/staff/controllers/staff.controller';
import { StaffService } from './modules/staff/services/StaffService';
import { PrismaDriverRepository } from './modules/staff/repositories/PrismaDriverRepository';
import { RoleService } from './modules/staff/services/role.service';

// --- Fleet Module ---
import { FleetRoute } from './modules/fleet/fleet.routes';
import { VehicleController } from './modules/fleet/controllers/VehicleController';
import { VehicleService } from './modules/fleet/services/VehicleService';
import { PrismaVehicleRepository } from './modules/fleet/repositories/PrismaVehicleRepository';

// --- Finance Module ---
import { FinanceRoute } from './modules/finance/finance.routes';
import { FinanceController } from './modules/finance/controllers/FinanceController';
import { FinanceService } from './modules/finance/services/FinanceService';
import { PrismaFinanceRepository } from './modules/finance/repositories/PrismaFinanceRepository';

// --- Transit Module ---
import { TransitRoute } from './modules/transit/transit.routes';
import { TransitController } from './modules/transit/controllers/TransitController';
import { TransitService } from './modules/transit/services/TransitService';
import { PrismaTransitRepository } from './modules/transit/repositories/PrismaTransitRepository';

// --- Trip Module ---
import { TripRoute } from './modules/trip/trip.routes';
import { TripController } from './modules/trip/controllers/TripController';
import { TripService } from './modules/trip/services/TripService';
import { PrismaTripRepository } from './modules/trip/repositories/PrismaTripRepository';

// --- Analytics Module ---
import { AnalyticsRoute } from './modules/analytics/analytics.routes';
import { AnalyticsController } from './modules/analytics/controllers/AnalyticsController';
import { AnalyticsService } from './modules/analytics/services/AnalyticsService';
import { PrismaAnalyticsRepository } from './modules/analytics/repositories/PrismaAnalyticsRepository';

// --- AI Conversational Analytics Module ---
import { AIAnalyticsRoute } from './modules/analytics/conversational/ai-analytics.routes';
import { bootstrapTools } from './modules/analytics/conversational/bootstrap';

// ============================================
// Dependency Injection — Composition Root
// ============================================

// 1. Auth
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);
const authRoute = new AuthRoute(authController);

// 2. Staff
const driverRepo = new PrismaDriverRepository();
const roleService = new RoleService();
const staffService = new StaffService(userRepo, driverRepo);
const staffController = new StaffController(staffService as any, roleService);
const staffRoute = new StaffRoute(staffController);

// 3. Fleet
const vehicleRepo = new PrismaVehicleRepository();
const vehicleService = new VehicleService(vehicleRepo);
const vehicleController = new VehicleController(vehicleService);
const fleetRoute = new FleetRoute(vehicleController);

// 4. Finance
const financeRepo = new PrismaFinanceRepository();
const financeService = new FinanceService(financeRepo);
const financeController = new FinanceController(financeService);
const financeRoute = new FinanceRoute(financeController);

// 5. Transit (Routes & Stops)
const transitRepo = new PrismaTransitRepository();
const transitService = new TransitService(transitRepo);
const transitController = new TransitController(transitService);
const transitRoute = new TransitRoute(transitController);

// 6. Trip (Dispatch & Driver Workflows)
const tripRepo = new PrismaTripRepository();
const tripService = new TripService(tripRepo);
const tripController = new TripController(tripService);
const tripRoute = new TripRoute(tripController);

// 7. Analytics
const analyticsRepo = new PrismaAnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepo);
const analyticsController = new AnalyticsController(analyticsService);
const analyticsRoute = new AnalyticsRoute(analyticsController);

// 8. AI Conversational Analytics
bootstrapTools(); // register tools
const aiAnalyticsRoute = new AIAnalyticsRoute();

// ============================================
// App Bootstrap
// ============================================

const app = new App([
    authRoute,
    staffRoute,
    fleetRoute,
    financeRoute,
    transitRoute,
    tripRoute,
    analyticsRoute,
    aiAnalyticsRoute,
]);

app.listen();
