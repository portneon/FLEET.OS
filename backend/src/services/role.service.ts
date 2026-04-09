import { prisma } from '../prisma';
import { Role } from '@prisma/client';
import { IRoleService } from '../interfaces/role.service.interface';

export class RoleService implements IRoleService {
    public async findOrCreateRole(name: string): Promise<Role> {
        let role = await prisma.role.findUnique({
            where: { name }
        });

        if (!role) {
            role = await prisma.role.create({
                data: { name }
            });
        }

        return role;
    }

    public async findAllRoles(): Promise<Role[]> {
        return prisma.role.findMany();
    }
}
