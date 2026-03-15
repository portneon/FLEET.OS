import { PrismaClient } from '@prisma/client';

// Generate a PrismaClient instance and attach it to the global object
// so that we don't exhaust the database connection limit inadvertently.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
