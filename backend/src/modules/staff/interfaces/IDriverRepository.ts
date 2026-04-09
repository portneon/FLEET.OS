import { DriverProfile } from '@prisma/client';

export interface IDriverRepository {
  createProfile(data: {
    userId: string;
    licenseNumber: string;
    experience: number;
  }): Promise<DriverProfile>;
  
  findByUserId(userId: string): Promise<DriverProfile | null>;
}