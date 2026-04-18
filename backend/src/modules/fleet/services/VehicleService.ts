// src/modules/fleet/services/VehicleService.ts

import { IVehicleService } from '../interfaces/IVehicleService';
import { IVehicleRepository, CreateVehicleDTO } from '../interfaces/IVehicleRepository';
import { Vehicle } from '@prisma/client';

export class VehicleService implements IVehicleService {

  constructor(private vehicleRepo: IVehicleRepository) {}

  public async registerVehicle(data: CreateVehicleDTO): Promise<Vehicle> {
   
    if (data.vin.length !== 17) {
      throw new Error("Vehicle Identification Number must be exactly 17 characters.");
    }

    
    if (data.type === 'BUS') {
      if (!data.seatingCapacity || data.seatingCapacity <= 0) {
        throw new Error("Bus registration requires a valid seating capacity.");
      }
    }

    if (data.type !== 'BUS' && data.seatingCapacity) {
      data.seatingCapacity = null;
    }


    const existingVehicle = await this.vehicleRepo.findByVin(data.vin);
    if (existingVehicle) {
      throw new Error("A vehicle with this VIN is already registered in the system.");
    }

    return await this.vehicleRepo.create(data);
  }

  public async getOrganizationFleet(orgId: string): Promise<Vehicle[]> {
  
    return await this.vehicleRepo.findByOrganization(orgId);
  }

  public async updateVehicleStatus(vehicleId: string, status: string): Promise<Vehicle> {

    const validStatuses = ['IDLE', 'ACTIVE', 'MAINTENANCE'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new Error("Invalid vehicle status.");
    }

    return await this.vehicleRepo.updateStatus(vehicleId, status.toUpperCase());
  }

  public async getVehicleHistory(vehicleId: string): Promise<any> {
    const history = await this.vehicleRepo.getVehicleHistory(vehicleId);
    if (!history) throw new Error("Vehicle not found.");
    return history;
  }
}