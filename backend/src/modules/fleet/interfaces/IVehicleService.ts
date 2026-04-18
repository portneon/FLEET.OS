import { Vehicle } from '@prisma/client';
import { CreateVehicleDTO } from './IVehicleRepository';

export interface IVehicleService {
  registerVehicle(data: CreateVehicleDTO): Promise<Vehicle>;
  getOrganizationFleet(orgId: string): Promise<Vehicle[]>;
  updateVehicleStatus(vehicleId: string, status: string): Promise<Vehicle>;
  getVehicleHistory(vehicleId: string): Promise<any>;
}