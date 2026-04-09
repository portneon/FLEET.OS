import { prisma } from '../prisma';
import { Staff } from '@prisma/client';
import { IStaffService } from '../interfaces/staff.service.interface';

export class StaffService implements IStaffService {
    public async registerStaff(staffData: Omit<Staff, 'id'>): Promise<Staff> {
        const staff = await prisma.staff.create({
            data: staffData,
            include: { role: true }
        });
        return staff;
    }

    public async findAllStaff(): Promise<Staff[]> {
        return prisma.staff.findMany({
            include: { role: true }
        });
    }

    public async loginStaff(email: string, password: string): Promise<Staff | null> {
        const staff = await prisma.staff.findUnique({
            where: { email }
        });

        if (staff && staff.password === password) {
            return staff;
        }
        return null;
    }
}
