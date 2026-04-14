import { User, Role, PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import * as bcrypt from 'bcrypt';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthService implements IAuthService {

    private readonly SALT_ROUNDS = 10;
    private prisma = new PrismaClient();

    constructor(private userRepo: UserRepository) {}

    public async createUser(userData: { email: string; password: string; organizationId: string; role?: Role; name?: string }): Promise<User> {
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
        
        const securedData: any = {
            ...userData,
            password: hashedPassword,
            name: userData.name || "",
            role: userData.role || Role.DRIVER
        };

        return await this.userRepo.create(securedData);
    }

    public async register(data: { email: string; password: string; role: Role; name: string; businessName?: string }): Promise<User> {
        // 1. Create Organization if Admin
        let organizationId: string;

        if (data.role === Role.ADMIN) {
            const org = await this.prisma.organization.create({
                data: {
                    name: data.businessName || `${data.name}`
                }
            });
            organizationId = org.id;
        } else {
             // For non-admins, they must already have an orgId (passed in or handled elsewhere)
             // For this prototype, if no orgId is passed for a non-admin, we might need a default or error
             throw new Error("Only Administrators can register new organizations currently.");
        }

        // 2. Create User
        return await this.createUser({
            email: data.email,
            password: data.password,
            role: data.role,
            name: data.name,
            organizationId
        });
    }

    public async login(email: string, password: string): Promise<{ user: User; organizationId: string }> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        return {
            user,
            organizationId: user.organizationId
        };
    }

    public async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findByEmail(email);
    }

    public async findAllUsersInOrg(orgId: string): Promise<User[]> {
        return await this.userRepo.findAllByOrg(orgId);
    }
}