
import { Vehicle, VehicleType } from '@prisma/client';

export interface CreateVehicleDTO {
  vin: string;
  type: VehicleType;
  licensePlate: string;
  seatingCapacity?: number | null;
  organizationId: string;
  status?: string;

  // Financial metadata
  purchasePrice?: number;
  purchaseDate?: Date;
  residualValue?: number;
  insuranceCost?: number;
  loanAmount?: number;
  monthlyEmi?: number;
  expectedLifeYears?: number;
}

export interface IVehicleRepository {
  create(data: CreateVehicleDTO): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByVin(vin: string): Promise<Vehicle | null>;
  findByOrganization(orgId: string): Promise<Vehicle[]>;
  updateStatus(id: string, status: string): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  getVehicleHistory(id: string): Promise<any>;
}