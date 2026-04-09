import { User, Role } from '@prisma/client';

export interface IAuthService {
    findAllUsersInOrg(orgId: string): Promise<User[]>;
    createUser(userData: { email: string; password: string; organizationId: string; role?: Role; name?: string }): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
}
