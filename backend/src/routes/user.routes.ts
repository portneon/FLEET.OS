import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { Routes } from '../interfaces/routes.interface';

export class UserRoute implements Routes {
    public path = '/users';
    public router = Router();
    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.userController.getUsers);
        this.router.post(`${this.path}`, this.userController.createUser);
    }
}
