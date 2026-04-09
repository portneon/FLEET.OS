"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = void 0;
const express_1 = require("express");
class AuthRoute {
    authController;
    path = '/users';
    router = (0, express_1.Router)();
    constructor(authController) {
        this.authController = authController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.authController.getUsers);
        this.router.post(`${this.path}`, this.authController.createUser);
        this.router.post(`${this.path}/login`, this.authController.loginUser);
    }
}
exports.AuthRoute = AuthRoute;
