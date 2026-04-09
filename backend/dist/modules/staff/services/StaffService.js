"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
class StaffService {
    userRepo;
    driverRepo;
    constructor(userRepo, driverRepo) {
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
    }
    async registerDriver(userData, licenseInfo) {
        const user = await this.userRepo.createUser(userData);
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
}
exports.StaffService = StaffService;
