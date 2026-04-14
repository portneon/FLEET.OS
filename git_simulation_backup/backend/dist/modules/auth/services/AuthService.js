"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../prisma");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
class AuthService {
    userRepo;
    SALT_ROUNDS = 10;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async createUser(userData) {
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
        const securedData = {
            ...userData,
            password: hashedPassword,
            name: userData.name || "",
            role: userData.role || client_1.Role.DRIVER
        };
        return await this.userRepo.create(securedData);
    }
    async register(data) {
        // 1. Create Organization if Admin
        let organizationId;
        if (data.role === client_1.Role.ADMIN) {
            const org = await prisma_1.prisma.organization.create({
                data: {
                    name: data.businessName || `${data.name}`
                }
            });
            organizationId = org.id;
        }
        else {
            // For non-admins, they must already have an orgId (passed in or handled elsewhere)
            // For this prototype, if no orgId is passed for a non-admin, we might need a default or error
            throw new Error("Only Administrators can register new organizations currently.");
        }
        // 2. Create User
        return await this.createUser({
            email: data.email,
            password: data.password,
            role: data.role,
            name: data.name,
            organizationId
        });
    }
    async login(email, password) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
        return {
            token,
            user,
            organizationId: user.organizationId
        };
    }
    async findUserByEmail(email) {
        return await this.userRepo.findByEmail(email);
    }
    async findAllUsersInOrg(orgId) {
        return await this.userRepo.findAllByOrg(orgId);
    }
}
exports.AuthService = AuthService;
