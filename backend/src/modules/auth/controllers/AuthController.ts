

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {

    constructor(private authService: AuthService) { }

    public getUsers = async (req: Request, res: Response): Promise<void> => {
        try {

            const orgId = req.headers['x-organization-id'] as string;

            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required for this operation' });
                return;
            }

            const users = await this.authService.findAllUsersInOrg(orgId);
            res.status(200).json({ data: users, message: 'Organization staff retrieved' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve users' });
        }
    };

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData = req.body;
            // The service now handles the complex logic of organization assignment
            const createdUser = await this.authService.register(userData);
            res.status(201).json({ data: createdUser, message: 'User successfully created' });
        } catch (error: any) {
            console.error('Registration Error:', error);
            res.status(400).json({ error: error.message });
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const session = await this.authService.login(email, password);
            if (!session) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            res.status(200).json({ data: session, message: 'Login successful' });
        } catch (error: any) {
            console.error('Login Error:', error);
            res.status(500).json({ error: error.message || 'Authentication failed' });
        }
    };
}