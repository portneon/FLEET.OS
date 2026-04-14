

import { PrismaClient, User, Role } from '@prisma/client';

export interface CreateUserDTO {
    email: string;
    name: string;
    password: string;
    role: Role;
    organizationId: string;
}

export class UserRepository {
    private prisma = new PrismaClient();

    public async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    public async create(userData: CreateUserDTO): Promise<User> {
        return await this.prisma.user.create({
            data: userData,
        });
    }

    public async findAllByOrg(orgId: string): Promise<User[]> {
        return await this.prisma.user.findMany({
            where: { 
                organizationId: orgId 
            },
            include: {
                driverProfile: true
            }
        });
    }
}