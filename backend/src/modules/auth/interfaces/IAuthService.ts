import { User, Role } from '@prisma/client';

export interface IAuthService {
    findAllUsersInOrg(orgId: string): Promise<User[]>;
    createUser(userData: { email: string; password: string; organizationId: string; role?: Role; name?: string }): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    register(data: { email: string; password: string; role: Role; name: string; businessName?: string }): Promise<User>;
    login(email: string, password: string): Promise<{ user: User; organizationId: string }>;
}
