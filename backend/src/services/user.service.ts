import { prisma } from '../prisma';
import { User } from '@prisma/client';

export class UserService {
    public async findAllUser(): Promise<User[]> {
        const users = await prisma.user.findMany();
        return users;
    }

    public async createUser(userData: { email: string; name?: string }): Promise<User> {
        const user = await prisma.user.create({ data: userData });
        return user;
    }
}
