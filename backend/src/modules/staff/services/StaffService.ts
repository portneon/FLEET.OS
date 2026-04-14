
import { IDriverRepository } from '../interfaces/IDriverRepository';
import { UserRepository } from '../../auth/repositories/UserRepository';
import { User, DriverProfile } from '@prisma/client';
import bcrypt from 'bcrypt';

export class StaffService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private userRepo: UserRepository,
    private driverRepo: IDriverRepository
  ) {}

  public async registerDriver(userData: any, licenseInfo: { licenseNumber: string; experience: number }) {
    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
    
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

  public async findAllStaff(orgId: string) {
    return await this.userRepo.findAllByOrg(orgId);
  }

  public async registerStaff(staffData: any) {
    const hashedPassword = await bcrypt.hash(staffData.password, this.SALT_ROUNDS);
    
    const data = {
      email: staffData.email,
      name: staffData.name || staffData.email,
      password: hashedPassword,
      organizationId: staffData.organizationId,
      role: staffData.role
    };
    
    return await this.userRepo.create(data);
  }

  public async loginStaff(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
        return user;
    }
    return null;
  }
}