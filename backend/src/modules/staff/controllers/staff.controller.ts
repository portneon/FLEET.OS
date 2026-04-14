import { Request, Response } from 'express';
import { IStaffService } from '../interfaces/staff.service.interface';
import { IRoleService } from '../interfaces/role.service.interface';
import { Role } from '@prisma/client';

export class StaffController {
    constructor(
        private staffService: IStaffService,
        private roleService: IRoleService
    ) { }

    public registerStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, name, password, roleName, licenseNumber, experience } = req.body;

            if (!email || !name || !password || !roleName) {
                res.status(400).json({ error: 'All fields (email, name, password, roleName) are required' });
                return;
            }

            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }

            if (roleName.toUpperCase() === 'DRIVER') {
                if (!licenseNumber || experience == null) {
                    res.status(400).json({ error: 'License number and experience are required for drivers' });
                    return;
                }

                const userData = {
                    email,
                    password,
                    organizationId: orgId,
                    role: roleName.toUpperCase() as Role
                };

                const licenseInfo = { licenseNumber, experience };

                const result = await this.staffService.registerDriver(userData, licenseInfo);
                res.status(201).json({ data: result, message: 'Driver successfully registered' });
            } else {
                const staffData = {
                    email,
                    name,
                    password,
                    organizationId: orgId,
                    role: roleName.toUpperCase() as Role
                };

                const createdStaff = await this.staffService.registerStaff(staffData);
                res.status(201).json({ data: createdStaff, message: 'Staff successfully registered' });
            }
        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'Staff with this email already exists' });
                return;
            }
            res.status(500).json({ error: 'Failed to register staff' });
        }
    };

    public loginStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const staff = await this.staffService.loginStaff(email, password);
            if (!staff) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            res.status(200).json({ data: staff, message: 'Staff successfully logged-in' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to login staff' });
        }
    };

    public getStaff = async (req: Request, res: Response): Promise<void> => {
        try {
            const orgId = req.headers['x-organization-id'] as string;
            if (!orgId) {
                res.status(400).json({ error: 'Organization ID is required' });
                return;
            }

            const staff = await this.staffService.findAllStaff(orgId);
            res.status(200).json({ data: staff, message: 'findAllStaff' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to find staff' });
        }
    };
}
