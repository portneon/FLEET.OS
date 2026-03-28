import { DriverProfile } from '@prisma/client';
import { prisma } from '../../../prisma';
import { IDriverRepository } from '../interfaces/IDriverRepository';

export class PrismaDriverRepository implements IDriverRepository {

  async createProfile(data: { userId: string; licenseNumber: string; experience: number }): Promise<DriverProfile> {
    return await prisma.driverProfile.create({
      data: {
        userId: data.userId,
        licenseNumber: data.licenseNumber,
        experience: data.experience
      }
    });
  }

  async findByUserId(userId: string): Promise<DriverProfile | null> {
    return await prisma.driverProfile.findUnique({ where: { userId } });
  }
}