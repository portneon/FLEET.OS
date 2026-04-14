"use strict";
// src/modules/auth/auth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class AuthRoute {
    authController;
    path = '/auth';
    router = (0, express_1.Router)();
    constructor(authController) {
        this.authController = authController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', this.authController.register);
        this.router.post('/login', this.authController.login);
        this.router.get('/users', auth_middleware_1.authenticate, this.authController.getUsers);
    }
}
exports.AuthRoute = AuthRoute;
