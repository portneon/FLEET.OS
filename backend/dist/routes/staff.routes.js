"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRoute = void 0;
const express_1 = require("express");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
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
        this.router.post(`${this.path}/register`, rbac_middleware_1.requireAdmin, this.staffController.registerStaff);
        // General staff login
        this.router.post(`${this.path}/login`, this.staffController.loginStaff);
        // Admin gets all staff
        this.router.get(`${this.path}`, rbac_middleware_1.requireAdmin, this.staffController.getStaff);
    }
}
exports.StaffRoute = StaffRoute;
