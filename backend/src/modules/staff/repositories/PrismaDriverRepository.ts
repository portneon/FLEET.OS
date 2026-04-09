import { PrismaClient, DriverProfile } from '@prisma/client';
import { IDriverRepository } from '../interfaces/IDriverRepository';

export class PrismaDriverRepository implements IDriverRepository {
  private prisma = new PrismaClient();

  async createProfile(data: { userId: string; licenseNumber: string; experience: number }): Promise<DriverProfile> {
    return await this.prisma.driver_profile.create({
      data: {
        userId: data.userId,
        licenseNumber: data.licenseNumber,
        experience: data.experience
      }
    });
  }

  async findByUserId(userId: string): Promise<DriverProfile | null> {
    return await this.prisma.driver_profile.findUnique({ where: { userId } });
  }
}