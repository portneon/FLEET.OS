import { prisma } from '../../../prisma';
import { Role } from '@prisma/client';
import { IRoleService } from '../interfaces/role.service.interface';

export class RoleService implements IRoleService {
    public async findOrCreateRole(name: string): Promise<Role> {
        // Since Role is an enum, we just validate it exists
        const roleValue = name.toUpperCase() as Role;
        if (Object.values(Role).includes(roleValue)) {
            return roleValue;
        }
        throw new Error(`Invalid role name: ${name}`);
    }

    public async findAllRoles(): Promise<Role[]> {
        return Object.values(Role);
    }
}
