import { Staff } from '@prisma/client';

export interface IStaffService {
    registerStaff(staffData: Omit<Staff, 'id'>): Promise<Staff>;
    findAllStaff(): Promise<Staff[]>;
    loginStaff(email: string, password: string): Promise<Staff | null>;
}
