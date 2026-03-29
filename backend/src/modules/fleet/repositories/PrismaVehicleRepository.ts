// src/modules/fleet/repositories/PrismaVehicleRepository.ts

import { Vehicle } from '@prisma/client';
import { prisma } from '../../../prisma';
import { IVehicleRepository, CreateVehicleDTO } from '../interfaces/IVehicleRepository';

export class PrismaVehicleRepository implements IVehicleRepository {

  async create(data: CreateVehicleDTO): Promise<Vehicle> {
    return await prisma.vehicle.create({
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
    return await prisma.vehicle.findUnique({ where: { vin } });
  }

  async findByOrganization(organizationId: string): Promise<Vehicle[]> {
    return await prisma.vehicle.findMany({
      where: { organizationId }
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return await prisma.vehicle.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<Vehicle> {
    return await prisma.vehicle.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({ where: { id } });
  }
}