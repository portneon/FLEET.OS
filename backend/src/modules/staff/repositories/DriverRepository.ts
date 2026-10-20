import { randomUUID } from 'node:crypto';
import {
    ExecuteValues,
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';
import { Database } from '../../../database/Database';
import {
    CreateDriverInput,
    DriverDetailsInput,
    DriverRecord,
    DriverStatus,
    DriverSummary,
} from '../domain/Driver';
import { IDriverRepository } from '../application/IDriverRepository';

type DriverRow = RowDataPacket & Omit<DriverRecord, 'licenseClasses'>;
const DRIVER_DETAIL_FIELDS: readonly (keyof DriverDetailsInput)[] = [
    'identificationType',
    'identificationNumber',
    'addressLine',
    'city',
    'state',
    'pincode',
    'dateOfBirth',
    'bloodGroup',
    'badgeNumber',
    'policeVerificationStatus',
    'medicalFitnessStatus',
];

export class DriverRepository implements IDriverRepository {
    constructor(private readonly database: Database) {}

    async findById(organizationId: string, driverId: string): Promise<DriverRecord | null> {
        const rows = await this.database.query<DriverRow[]>(
            `SELECT driver.*, details.identificationType, details.identificationNumber,
                    details.addressLine, details.city, details.state, details.pincode,
                    details.dateOfBirth, details.bloodGroup, details.badgeNumber,
                    details.policeVerificationStatus, details.medicalFitnessStatus
             FROM DRIVER AS driver
             LEFT JOIN DRIVER_DETAILS AS details ON details.driverId = driver.id
             WHERE driver.id = ? AND driver.organizationId = ?`,
            [driverId, organizationId],
        );
        const driver = rows[0];
        if (!driver) return null;

        const classes = await this.database.query<Array<RowDataPacket & { vehicleClass: string }>>(
            `SELECT licenseClass.vehicleClass
             FROM DRIVER_LICENSE_CLASS AS licenseClass
             INNER JOIN DRIVER AS driver ON driver.id = licenseClass.driverId
             WHERE licenseClass.driverId = ? AND driver.organizationId = ?
             ORDER BY licenseClass.vehicleClass`,
            [driverId, organizationId],
        );
        return { ...driver, licenseClasses: classes.map(({ vehicleClass }) => vehicleClass) };
    }

    async findAll(
        organizationId: string,
        pagination: { limit?: number; offset?: number } = {},
    ): Promise<DriverSummary[]> {
        const limit = Math.floor(Math.max(1, Math.min(Number(pagination.limit) || 50, 100)));
        const offset = Math.floor(Math.max(0, Number(pagination.offset) || 0));
        return this.database.query<Array<RowDataPacket & DriverSummary>>(
            `SELECT id, firstName, lastName, email, phoneNumber, licenseNumber,
                    licenseExpiryDate, licenseVerificationStatus, status, createdAt
             FROM DRIVER
             WHERE organizationId = ?
             ORDER BY createdAt DESC
             LIMIT ? OFFSET ?`,
            [organizationId, limit, offset],
        );
    }

    async create(organizationId: string, input: CreateDriverInput): Promise<DriverRecord> {
        const driverId = randomUUID();
        await this.database.transaction(async (transaction) => {
            await transaction.query<ResultSetHeader>(
                `INSERT INTO DRIVER (
                    id, organizationId, firstName, lastName, email, phoneNumber, licenseNumber,
                    licenseIssueDate, licenseExpiryDate, licenseIssuingAuthority,
                    licenseUrl, emergencyContactName, emergencyContactPhone
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    driverId,
                    organizationId,
                    input.firstName,
                    input.lastName,
                    input.email ?? null,
                    input.phoneNumber,
                    input.licenseNumber,
                    input.licenseIssueDate ?? null,
                    input.licenseExpiryDate,
                    input.licenseIssuingAuthority ?? null,
                    input.licenseUrl ?? null,
                    input.emergencyContactName ?? null,
                    input.emergencyContactPhone ?? null,
                ],
            );

            if (input.details) {
                await transaction.query<ResultSetHeader>(
                    `INSERT INTO DRIVER_DETAILS (
                        id, driverId, identificationType, identificationNumber,
                        addressLine, city, state, pincode, dateOfBirth, bloodGroup, badgeNumber,
                        policeVerificationStatus, medicalFitnessStatus
                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        randomUUID(),
                        driverId,
                        input.details.identificationType ?? null,
                        input.details.identificationNumber ?? null,
                        input.details.addressLine ?? null,
                        input.details.city ?? null,
                        input.details.state ?? null,
                        input.details.pincode ?? null,
                        input.details.dateOfBirth ?? null,
                        input.details.bloodGroup ?? null,
                        input.details.badgeNumber ?? null,
                        input.details.policeVerificationStatus ?? 'NOT_REQUIRED',
                        input.details.medicalFitnessStatus ?? 'NOT_REQUIRED',
                    ],
                );
            }

            for (const vehicleClass of input.vehicleClasses ?? []) {
                await transaction.query<ResultSetHeader>(
                    'INSERT INTO DRIVER_LICENSE_CLASS (id, driverId, vehicleClass) VALUES (?, ?, ?)',
                    [randomUUID(), driverId, vehicleClass],
                );
            }
        });

        const driver = await this.findById(organizationId, driverId);
        if (!driver) throw new Error('Created driver could not be retrieved');
        return driver;
    }

    async updateDetails(
        organizationId: string,
        driverId: string,
        details: DriverDetailsInput,
    ): Promise<DriverRecord | null> {
        const extraField = Object.keys(details).find(
            (field) => !DRIVER_DETAIL_FIELDS.some((allowed) => allowed === field),
        );
        if (extraField) throw new Error(`Unsupported driver detail field: ${extraField}`);

        const columns: Array<keyof DriverDetailsInput> = [];
        const values: ExecuteValues[] = [];
        for (const field of DRIVER_DETAIL_FIELDS) {
            const value = details[field];
            if (value !== undefined) {
                columns.push(field);
                values.push(value);
            }
        }

        if (columns.length === 0) return this.findById(organizationId, driverId);

        const placeholders = ['?', '?', ...columns.map(() => '?')].join(', ');
        const updates = columns
            .map((column) => `${column} = VALUES(${column})`)
            .join(', ');

        await this.database.transaction(async (transaction) => {
            const drivers = await transaction.query<RowDataPacket[]>(
                'SELECT id FROM DRIVER WHERE id = ? AND organizationId = ? FOR UPDATE',
                [driverId, organizationId],
            );
            if (!drivers[0]) return;

            await transaction.query<ResultSetHeader>(
                `INSERT INTO DRIVER_DETAILS (id, driverId, ${columns.join(', ')})
                 VALUES (${placeholders})
                 ON DUPLICATE KEY UPDATE ${updates}, updatedAt = CURRENT_TIMESTAMP`,
                [randomUUID(), driverId, ...values],
            );
        });

        return this.findById(organizationId, driverId);
    }

    async updateStatus(
        organizationId: string,
        driverId: string,
        status: DriverStatus,
    ): Promise<DriverRecord | null> {
        await this.database.query<ResultSetHeader>(
            'UPDATE DRIVER SET status = ? WHERE id = ? AND organizationId = ?',
            [status, driverId, organizationId],
        );
        return this.findById(organizationId, driverId);
    }
}
