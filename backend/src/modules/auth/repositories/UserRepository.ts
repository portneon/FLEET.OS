import { User, Role } from '@prisma/client';
import { prisma } from '../../../prisma';

export interface CreateUserDTO {
    email: string;
    name: string;
    password: string;
    role: Role;
    organizationId: string;
}

export class UserRepository {

    public async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    public async create(userData: CreateUserDTO): Promise<User> {
        return await prisma.user.create({
            data: userData,
        });
    }

    public async findAllByOrg(orgId: string): Promise<User[]> {
        return await prisma.user.findMany({
            where: { 
                organizationId: orgId 
            },
            include: {
                driverProfile: true
            }
        });
    }

    public async findStaffHistory(userId: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                driverProfile: {
                    include: {
                        trips: {
                            include: {
                                route: true,
                                vehicle: true,
                                bookings: true
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });
    }
}