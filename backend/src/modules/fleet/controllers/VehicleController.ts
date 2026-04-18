// src/modules/fleet/controllers/VehicleController.ts

import { Request, Response } from 'express';
import { IVehicleService } from '../interfaces/IVehicleService';
import { VehicleType } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        organizationId: string;
    };
}

export class VehicleController {
    constructor(private vehicleService: IVehicleService) { }

    public registerVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { vin, type, licensePlate, seatingCapacity } = req.body;

            // In a real SaaS, organizationId comes from the JWT/Auth Middleware
            const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

            if (!vin || !type || !licensePlate || !organizationId) {
                res.status(400).json({ error: 'VIN, Type, License Plate, and Organization ID are required' });
                return;
            }

            const vehicle = await this.vehicleService.registerVehicle({
                vin,
                type: type as VehicleType,
                licensePlate,
                seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
                organizationId
            });

            res.status(201).json({ 
                data: vehicle, 
                message: `${type} successfully registered in fleet` 
            });
        } catch (error: any) {
            // Handle specific domain errors thrown by the Service
            const status = error.message.includes('already registered') ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    };

    public getFleet = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            
            if (!organizationId) {
                res.status(403).json({ error: 'Organization context missing' });
                return;
            }

            const fleet = await this.vehicleService.getOrganizationFleet(organizationId);
            res.status(200).json({ data: fleet, message: 'Fleet retrieved successfully' });
        } catch (error) {
            console.error('[VehicleController.getFleet] Error:', error);
            res.status(500).json({ error: 'Failed to retrieve fleet data' });
        }
    };

    public getVehicleHistory = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;
            if (!organizationId) {
                res.status(403).json({ error: 'Organization context missing' });
                return;
            }

            const history = await this.vehicleService.getVehicleHistory(req.params.id);
            res.status(200).json({ data: history, message: 'Vehicle history retrieved successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}