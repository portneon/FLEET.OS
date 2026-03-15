"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
class UserRoute {
    path = '/users';
    router = (0, express_1.Router)();
    userController = new user_controller_1.UserController();
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.userController.getUsers);
        this.router.post(`${this.path}`, this.userController.createUser);
    }
}
exports.UserRoute = UserRoute;
