CREATE TABLE DRIVER (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organizationId CHAR(36) NOT NULL,

    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phoneNumber VARCHAR(20) NOT NULL,

    licenseNumber VARCHAR(50) NOT NULL,
    licenseIssueDate DATE,
    licenseExpiryDate DATE NOT NULL,
    licenseIssuingAuthority VARCHAR(150),

    licenseVerificationStatus ENUM(
        'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'
    ) NOT NULL DEFAULT 'PENDING',

    licenseVerifiedAt TIMESTAMP NULL,
    licenseUrl VARCHAR(500),

    emergencyContactName VARCHAR(150),
    emergencyContactPhone VARCHAR(20),

    status ENUM(
        'ACTIVE', 'INACTIVE', 'SUSPENDED'
    ) NOT NULL DEFAULT 'ACTIVE',

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_driver_organization
        FOREIGN KEY (organizationId)
        REFERENCES Organization(id),
    CONSTRAINT uq_driver_org_email UNIQUE (organizationId, email),
    CONSTRAINT uq_driver_org_license UNIQUE (organizationId, licenseNumber),
    INDEX idx_driver_org_phone (organizationId, phoneNumber),
    INDEX idx_driver_org_license_expiry (organizationId, licenseExpiryDate)
);
CREATE TABLE DRIVER_DETAILS (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    driverId CHAR(36) NOT NULL UNIQUE,

    -- Identity information (optional)
    identificationType ENUM(
        'AADHAAR',
        'PAN',
        'VOTER_ID',
        'PASSPORT',
        'OTHER'
    ),
    identificationNumber VARCHAR(100),

    -- Address
    addressLine VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode CHAR(6),

    -- Personal information
    dateOfBirth DATE,
    bloodGroup ENUM(
        'A+', 'A-', 'B+', 'B-',
        'AB+', 'AB-', 'O+', 'O-'
    ),

    -- Conditional compliance information
    badgeNumber VARCHAR(50),

    policeVerificationStatus ENUM(
        'NOT_REQUIRED',
        'PENDING',
        'VERIFIED',
        'REJECTED'
    ) NOT NULL DEFAULT 'NOT_REQUIRED',

    medicalFitnessStatus ENUM(
        'NOT_REQUIRED',
        'PENDING',
        'FIT',
        'UNFIT'
    ) NOT NULL DEFAULT 'NOT_REQUIRED',

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_driver_details_driver
        FOREIGN KEY (driverId)
        REFERENCES DRIVER(id)
        ON DELETE CASCADE
);
CREATE TABLE DRIVER_LICENSE_CLASS (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    driverId CHAR(36) NOT NULL,
    vehicleClass VARCHAR(30) NOT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_license_class_driver
        FOREIGN KEY (driverId)
        REFERENCES DRIVER(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_driver_vehicle_class
        UNIQUE (driverId, vehicleClass)
);
