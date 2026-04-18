import { User } from '@prisma/client';

export interface IStaffService {
    registerStaff(staffData: any): Promise<User>;
    registerDriver(userData: any, licenseInfo: { licenseNumber: string; experience: number }): Promise<any>;
    findAllStaff(orgId: string): Promise<User[]>;
    loginStaff(email: string, password: string): Promise<User | null>;
    getStaffHistory(userId: string): Promise<User | null>;
    updateStaff(userId: string, data: any): Promise<User>;
    deleteStaff(userId: string): Promise<User>;
    toggleStaffStatus(userId: string): Promise<User>;
}
