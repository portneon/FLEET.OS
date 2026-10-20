import {
    CreateDriverInput,
    DriverDetailsInput,
    DriverRecord,
    DriverStatus,
    DriverSummary,
} from '../domain/Driver';

export interface IDriverRepository {
    findById(organizationId: string, driverId: string): Promise<DriverRecord | null>;
    findAll(
        organizationId: string,
        pagination?: { limit?: number; offset?: number },
    ): Promise<DriverSummary[]>;
    create(organizationId: string, input: CreateDriverInput): Promise<DriverRecord>;
    updateDetails(
        organizationId: string,
        driverId: string,
        details: DriverDetailsInput,
    ): Promise<DriverRecord | null>;
    updateStatus(
        organizationId: string,
        driverId: string,
        status: DriverStatus,
    ): Promise<DriverRecord | null>;
}
