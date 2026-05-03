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
        status: data.status || 'IDLE',
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        residualValue: data.residualValue,
        insuranceCost: data.insuranceCost,
        loanAmount: data.loanAmount,
        monthlyEmi: data.monthlyEmi,
        expectedLifeYears: data.expectedLifeYears
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

  async getVehicleHistory(id: string): Promise<any> {
    return await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          include: {
            route: true,
            driver: { include: { user: true } },
            bookings: true
          },
          orderBy: { createdAt: 'desc' }
        },
        fuelLogs: { orderBy: { filledAt: 'desc' }, take: 20 },
        maintenanceLogs: { orderBy: { servicedAt: 'desc' }, take: 20 },
        expenses: { orderBy: { expenseDate: 'desc' }, take: 20 }
      }
    });
  }
}