"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
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
    loginUser = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const existingUser = await this.userService.findUserByEmail(email);
            if (!existingUser) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            res.status(200).json({ data: existingUser, message: 'logged-in' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to login user' });
        }
    };
}
exports.AuthController = AuthController;
