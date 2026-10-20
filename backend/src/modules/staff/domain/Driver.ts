export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type LicenseVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface DriverDetailsInput {
    identificationType?: 'AADHAAR' | 'PAN' | 'VOTER_ID' | 'PASSPORT' | 'OTHER' | null;
    identificationNumber?: string | null;
    addressLine?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    dateOfBirth?: string | null;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    badgeNumber?: string | null;
    policeVerificationStatus?: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    medicalFitnessStatus?: 'NOT_REQUIRED' | 'PENDING' | 'FIT' | 'UNFIT';
}

export interface CreateDriverInput {
    firstName: string;
    lastName: string;
    email?: string | null;
    phoneNumber: string;
    licenseNumber: string;
    licenseIssueDate?: string | null;
    licenseExpiryDate: string;
    licenseIssuingAuthority?: string | null;
    licenseUrl?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    details?: DriverDetailsInput;
    vehicleClasses?: string[];
}

export interface DriverRecord {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    licenseNumber: string;
    licenseIssueDate: string | null;
    licenseExpiryDate: string;
    licenseIssuingAuthority: string | null;
    licenseVerificationStatus: LicenseVerificationStatus;
    licenseVerifiedAt: string | null;
    licenseUrl: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    status: DriverStatus;
    createdAt: string;
    updatedAt: string;
    identificationType: DriverDetailsInput['identificationType'];
    identificationNumber: string | null;
    addressLine: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    dateOfBirth: string | null;
    bloodGroup: DriverDetailsInput['bloodGroup'];
    badgeNumber: string | null;
    policeVerificationStatus: DriverDetailsInput['policeVerificationStatus'] | null;
    medicalFitnessStatus: DriverDetailsInput['medicalFitnessStatus'] | null;
    licenseClasses: string[];
}

export type DriverSummary = Pick<
    DriverRecord,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phoneNumber'
    | 'licenseNumber'
    | 'licenseExpiryDate'
    | 'licenseVerificationStatus'
    | 'status'
    | 'createdAt'
>;
