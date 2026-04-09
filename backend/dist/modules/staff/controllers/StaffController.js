"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
class StaffController {
    staffService;
    constructor(staffService) {
        this.staffService = staffService;
    }
    registerStaff = async (req, res) => {
        try {
            const { email, name, password, roleName, licenseNumber, experience } = req.body;
            if (!email || !name || !password || !roleName) {
                res.status(400).json({ error: 'Core fields (email, name, password, roleName) are required' });
                return;
            }
            let result;
            if (roleName.toUpperCase() === 'DRIVER') {
                result = await this.staffService.registerDriver({ email, name, password, roleName }, { licenseNumber, experience: parseInt(experience) });
            }
            else {
                result = await this.staffService.registerStandardStaff({ email, name, password, roleName });
            }
            res.status(201).json({
                data: result,
                message: `${roleName} profile successfully provisioned.`
            });
        }
        catch (error) {
            const status = error.message.includes('already exists') ? 409 : 500;
            res.status(status).json({ error: error.message });
        }
    };
    getStaff = async (req, res) => {
        try {
            const orgId = req.headers['x-organization-id'];
            if (!orgId) {
                res.status(400).json({ error: "Organization ID is required" });
                return;
            }
            const staff = await this.staffService.findAllStaff(orgId);
            res.status(200).json({ data: staff });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to retrieve staff list' });
        }
    };
}
exports.StaffController = StaffController;
