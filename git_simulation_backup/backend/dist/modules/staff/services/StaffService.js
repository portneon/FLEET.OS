"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class StaffService {
    userRepo;
    driverRepo;
    SALT_ROUNDS = 10;
    constructor(userRepo, driverRepo) {
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
    }
    async registerDriver(userData, licenseInfo) {
        // Hash the password before creating the user
        const hashedPassword = await bcrypt_1.default.hash(userData.password, this.SALT_ROUNDS);
        const userDataWithHash = {
            ...userData,
            password: hashedPassword,
            name: userData.name || userData.email
        };
        const user = await this.userRepo.create(userDataWithHash);
        const profile = await this.driverRepo.createProfile({
            userId: user.id,
            licenseNumber: licenseInfo.licenseNumber,
            experience: licenseInfo.experience
        });
        return { user, profile };
    }
    async findAllStaff(orgId) {
        return await this.userRepo.findAllByOrg(orgId);
    }
    async registerStaff(staffData) {
        const hashedPassword = await bcrypt_1.default.hash(staffData.password, this.SALT_ROUNDS);
        const data = {
            email: staffData.email,
            name: staffData.name || staffData.email,
            password: hashedPassword,
            organizationId: staffData.organizationId,
            role: staffData.role
        };
        return await this.userRepo.create(data);
    }
    async loginStaff(email, password) {
        const user = await this.userRepo.findByEmail(email);
        if (user && await bcrypt_1.default.compare(password, user.password)) {
            return user;
        }
        return null;
    }
}
exports.StaffService = StaffService;
