
import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

export class AuthService {

    private readonly SALT_ROUNDS = 10;

    constructor(private userRepo: UserRepository) {}

 
    public async createUser(userData: { email: string; password: string; organizationId: string; role?: any; name?: string }): Promise<User> {
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

     
        const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
        
        const securedData = {
            ...userData,
            password: hashedPassword
        };

        return await this.userRepo.create(securedData);
    }

    public async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findByEmail(email);
    }

    public async findAllUsersInOrg(orgId: string): Promise<User[]> {
        return await this.userRepo.findAllByOrg(orgId);
    }
}

  
    public async findAllUsersInOrg(orgId: string): Promise<User[]> {
        return await this.userRepo.findAllByOrg(orgId);
    }
}