import { Role } from '@prisma/client';
import { prisma } from './prisma';

async function main() {
    let admin = await prisma.user.findUnique({ where: { email: 'admin@fleetos.com' } });
    if (!admin) {
        
        const org = await prisma.organization.create({
            data: {
                name: 'FleetOS Demo Organization'
            }
        });

        admin = await prisma.user.create({
            data: {
                email: 'admin@fleetos.com',
                name: 'Temp Admin',
                password: 'password123',
                role: Role.ADMIN,
                organizationId: org.id
            }
        });
        console.log('Created Temp Admin:', admin);
    } else {
        console.log('Admin already exists:', admin);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
