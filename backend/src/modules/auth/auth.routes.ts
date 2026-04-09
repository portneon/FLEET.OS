// src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { UserRepository } from './repositories/UserRepository';
import { AuthService } from './services/AuthService';
import { AuthController } from './controllers/AuthController';

const router = Router();

const userRepo = new UserRepository();

const authService = new AuthService(userRepo);

const authController = new AuthController(authService);
router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/users', authController.getUsers);

export default router;