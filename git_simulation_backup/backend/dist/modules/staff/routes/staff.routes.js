"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRoute = void 0;
const express_1 = require("express");
const rbac_middleware_1 = require("../../../middlewares/rbac.middleware");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
class StaffRoute {
    staffController;
    path = '/staff';
    router = (0, express_1.Router)();
    constructor(staffController) {
        this.staffController = staffController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Admin only route
        this.router.post('/register', auth_middleware_1.authenticate, rbac_middleware_1.requireAdmin, this.staffController.registerStaff);
        // General staff login
        this.router.post('/login', this.staffController.loginStaff);
        // Admin gets all staff
        this.router.get('/', rbac_middleware_1.requireAdmin, this.staffController.getStaff);
    }
}
exports.StaffRoute = StaffRoute;
