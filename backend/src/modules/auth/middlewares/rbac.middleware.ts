import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../../../prisma';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const adminEmail = req.headers['x-admin-email'] as string;

        if (!adminEmail) {
            res.status(401).json({ error: 'Unauthorized: No Admin Email provided in headers' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user || user.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Forbidden: Requires Admin privileges' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error in RBAC middleware' });
    }
};