// src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { Routes } from '../../../shared/interfaces/routes.interface';
import { authenticate } from '../../../middlewares/auth.middleware';

export class AuthRoute implements Routes {
    public path = '/auth';
    public router = Router();

    constructor(public authController: AuthController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/register', this.authController.register);
        this.router.post('/login', this.authController.login);
        this.router.get('/users', authenticate, this.authController.getUsers);
    }
}