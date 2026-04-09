"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
class StaffController {
    staffService;
    roleService;
    constructor(staffService, roleService) {
        this.staffService = staffService;
        this.roleService = roleService;
    }
    registerStaff = async (req, res) => {
        try {
            const { email, name, password, roleName } = req.body;
            if (!email || !name || !password || !roleName) {
                res.status(400).json({ error: 'All fields (email, name, password, roleName) are required' });
                return;
            }
            const role = await this.roleService.findOrCreateRole(roleName);
            const staffData = {
                email,
                name,
                password,
                roleId: role.id
            };
            const createdStaff = await this.staffService.registerStaff(staffData);
            res.status(201).json({ data: createdStaff, message: 'Staff successfully registered' });
        }
        catch (error) {
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'Staff with this email already exists' });
                return;
            }
            res.status(500).json({ error: 'Failed to register staff' });
        }
    };
    loginStaff = async (req, res) => {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to login staff' });
        }
    };
    getStaff = async (req, res) => {
        try {
            const staff = await this.staffService.findAllStaff();
            res.status(200).json({ data: staff, message: 'findAllStaff' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to find staff' });
        }
    };
}
exports.StaffController = StaffController;
