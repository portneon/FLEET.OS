"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = require("./prisma");
async function main() {
    let admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin@fleetos.com' } });
    if (!admin) {
        // Create organization first
        const org = await prisma_1.prisma.organization.create({
            data: {
                name: 'FleetOS Demo Organization'
            }
        });
        admin = await prisma_1.prisma.user.create({
            data: {
                email: 'admin@fleetos.com',
                name: 'Temp Admin',
                password: 'password123',
                role: client_1.Role.ADMIN,
                organizationId: org.id
            }
        });
        console.log('Created Temp Admin:', admin);
    }
    else {
        console.log('Admin already exists:', admin);
    }
}
main().catch(console.error).finally(() => prisma_1.prisma.$disconnect());
