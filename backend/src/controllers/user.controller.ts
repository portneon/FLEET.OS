import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
    public userService = new UserService();

    public getUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userService.findAllUser();
            res.status(200).json({ data: users, message: 'findAll' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to find users' });
        }
    };

    public createUser = async (req: Request, res: Response) => {
        try {
            const userData = req.body;
            const createUserData = await this.userService.createUser(userData);
            res.status(201).json({ data: createUserData, message: 'created' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create user' });
        }
    };
}
