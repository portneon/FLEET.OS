// src/modules/fleet/repositories/PrismaVehicleRepository.ts

import { PrismaClient, Vehicle } from '@prisma/client';
import { IVehicleRepository, CreateVehicleDTO } from '../interfaces/IVehicleRepository';

export class PrismaVehicleRepository implements IVehicleRepository {
  private prisma = new PrismaClient();

  async create(data: CreateVehicleDTO): Promise<Vehicle> {
    return await this.prisma.vehicle.create({
      data: {
        vin: data.vin,
        type: data.type,
        licensePlate: data.licensePlate,
        seatingCapacity: data.seatingCapacity,
        organizationId: data.organizationId,
        status: data.status || 'IDLE'
      }
    });
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({ where: { vin } });
  }

  async findByOrganization(organizationId: string): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany({
      where: { organizationId }
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<Vehicle> {
    return await this.prisma.vehicle.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({ where: { id } });
  }
}