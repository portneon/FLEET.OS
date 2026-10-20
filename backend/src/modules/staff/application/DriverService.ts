import {
    CreateDriverInput,
    DriverDetailsInput,
    DriverRecord,
    DriverStatus,
    DriverSummary,
} from '../domain/Driver';
import { IDriverRepository } from './IDriverRepository';

export class DriverNotFoundError extends Error {
    constructor() {
        super('Driver not found');
        this.name = 'DriverNotFoundError';
    }
}

export class DriverValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DriverValidationError';
    }
}

export class DriverService {
    constructor(private readonly driverRepository: IDriverRepository) {}

    async getDriver(organizationId: string, driverId: string): Promise<DriverRecord> {
        this.requireOrganizationId(organizationId);
        const driver = await this.driverRepository.findById(organizationId, driverId);
        if (!driver) throw new DriverNotFoundError();
        return driver;
    }

    listDrivers(
        organizationId: string,
        pagination?: { limit?: number; offset?: number },
    ): Promise<DriverSummary[]> {
        this.requireOrganizationId(organizationId);
        return this.driverRepository.findAll(organizationId, pagination);
    }

    createDriver(organizationId: string, input: CreateDriverInput): Promise<DriverRecord> {
        this.requireOrganizationId(organizationId);
        if (!input || typeof input !== 'object') {
            throw new DriverValidationError('Driver data is required');
        }

        const required: Array<keyof CreateDriverInput> = [
            'firstName', 'lastName', 'phoneNumber', 'licenseNumber', 'licenseExpiryDate',
        ];
        const missing = required.filter((field) => !input[field]);
        if (missing.length > 0) {
            throw new DriverValidationError(`Required driver fields missing: ${missing.join(', ')}`);
        }
        return this.driverRepository.create(organizationId, input);
    }

    async updateDriverDetails(
        organizationId: string,
        driverId: string,
        details: DriverDetailsInput,
    ): Promise<DriverRecord> {
        this.requireOrganizationId(organizationId);
        if (!details || typeof details !== 'object' || Array.isArray(details)) {
            throw new DriverValidationError('Driver details must be an object');
        }
        const driver = await this.driverRepository.updateDetails(organizationId, driverId, details);
        if (!driver) throw new DriverNotFoundError();
        return driver;
    }

    async changeDriverStatus(
        organizationId: string,
        driverId: string,
        status: DriverStatus,
    ): Promise<DriverRecord> {
        this.requireOrganizationId(organizationId);
        if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            throw new DriverValidationError('Invalid driver status');
        }
        const driver = await this.driverRepository.updateStatus(organizationId, driverId, status);
        if (!driver) throw new DriverNotFoundError();
        return driver;
    }

    private requireOrganizationId(organizationId: string): void {
        if (typeof organizationId !== 'string' || organizationId.trim().length === 0) {
            throw new DriverValidationError('Organization context is required');
        }
    }
}
