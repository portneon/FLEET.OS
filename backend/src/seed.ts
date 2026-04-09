import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    let admin = await prisma.user.findUnique({ where: { email: 'admin@fleetos.com' } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                email: 'admin@fleetos.com',
                name: 'Temp Admin',
                password: 'password123',
                role: 'Admin'
            }
        });
        console.log('Created Temp Admin:', admin);
    } else {
        console.log('Admin already exists:', admin);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
