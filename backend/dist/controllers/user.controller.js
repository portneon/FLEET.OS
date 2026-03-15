"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    userService = new user_service_1.UserService();
    getUsers = async (req, res) => {
        try {
            const users = await this.userService.findAllUser();
            res.status(200).json({ data: users, message: 'findAll' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to find users' });
        }
    };
    createUser = async (req, res) => {
        try {
            const userData = req.body;
            const createUserData = await this.userService.createUser(userData);
            res.status(201).json({ data: createUserData, message: 'created' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create user' });
        }
    };
}
exports.UserController = UserController;
