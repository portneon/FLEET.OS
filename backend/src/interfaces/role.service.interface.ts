import { Role } from '@prisma/client';

export interface IRoleService {
    findOrCreateRole(name: string): Promise<Role>;
    findAllRoles(): Promise<Role[]>;
}
