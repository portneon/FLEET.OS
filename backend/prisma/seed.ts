import { PrismaClient, Role, VehicleType, TripStatus, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Demo Seeding...');

  // 1. Clear Existing Demo Data (Optional - use with caution)
  // For safety, we just add new data if it doesn't exist, but here we'll create a fresh org.

  const SALT_ROUNDS = 10;
  const demoEmail = 'admin@lazy.com';
  const hashedPassword = await bcrypt.hash('lazy123', SALT_ROUNDS);

  // 2. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-id' }, // Fixed ID for demo consistency if needed
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Lazy Logistics',
    },
  });

  console.log('✅ Organization Created:', org.name);

  // 3. Create Demo Admin
  const admin = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: demoEmail,
      name: 'Lazy Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      organizationId: org.id,
      isActive: true,
    },
  });

  console.log('✅ Admin Created:', admin.email);

  // 4. Create Staff (Drivers)
  const driversData = [
    { name: 'Michael Chen', email: 'm.chen@lazy.com', license: 'LC-9921', exp: 8 },
    { name: 'Sarah Miller', email: 's.miller@lazy.com', license: 'LC-1102', exp: 5 },
    { name: 'Derrick Rose', email: 'd.rose@lazy.com', license: 'LC-4432', exp: 12 },
    { name: 'Elena Gilbert', email: 'e.gilbert@lazy.com', license: 'LC-8871', exp: 3 },
  ];

  for (const d of driversData) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        name: d.name,
        password: hashedPassword,
        role: Role.DRIVER,
        organizationId: org.id,
      },
    });

    await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        licenseNumber: d.license,
        experience: d.exp,
      },
    });
  }

  console.log('✅ Staff Profiles Created');

  // 5. Create Vehicles
  const vehicles = [
    { vin: 'VIN-VOLVO-001', plate: 'LX-44-VOL', type: VehicleType.TRUCK, status: 'IDLE' },
    { vin: 'VIN-NAV-002', plate: 'LX-88-NAV', type: VehicleType.VAN, status: 'EN_ROUTE' },
    { vin: 'VIN-SCANIA-003', plate: 'LX-22-SCA', type: VehicleType.TRUCK, status: 'MAINTENANCE' },
    { vin: 'VIN-SPRINT-004', plate: 'LX-11-SPR', type: VehicleType.VAN, status: 'IDLE' },
    { vin: 'VIN-MERC-005', plate: 'LX-99-MER', type: VehicleType.BUS, status: 'IDLE' },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: {},
      create: {
        vin: v.vin,
        licensePlate: v.plate,
        type: v.type,
        status: v.status,
        organizationId: org.id,
        seatingCapacity: v.type === VehicleType.BUS ? 50 : null,
      },
    });
  }

  console.log('✅ Fleet Created');

  // 6. Create Routes
  const routeNames = ['Express Terminal A', 'Downtown Logistics Hub', 'Coastal Freight Line'];
  const routes = [];
  for (const name of routeNames) {
    const r = await prisma.route.create({
      data: {
        name,
        organizationId: org.id,
      },
    });
    routes.push(r);
  }

  console.log('✅ Routes Created');

  // 7. Create Historical Trips (Last 30 Days)
  const completedTrips = [];
  const allDrivers = await prisma.driverProfile.findMany();
  const allVehicles = await prisma.vehicle.findMany();

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const trip = await prisma.trip.create({
      data: {
        routeId: routes[i % routes.length].id,
        vehicleId: allVehicles[i % allVehicles.length].id,
        driverId: allDrivers[i % allDrivers.length].id,
        status: TripStatus.COMPLETED,
        scheduledStart: date,
        actualStart: date,
        actualEnd: new Date(date.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
        organizationId: org.id,
      },
    });
    completedTrips.push(trip);
  }

  console.log('✅ Historical Trips Created');

  // 8. Create Financial Transactions
  const categories = ['FUEL', 'MAINTENANCE', 'REVENUE', 'SALARY', 'INSURANCE'];
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 2));
    const isRevenue = i % 3 === 0;

    await prisma.transaction.create({
      data: {
        amount: isRevenue ? 1500 + Math.random() * 500 : 200 + Math.random() * 300,
        type: isRevenue ? TransactionType.INCOME : TransactionType.EXPENSE,
        category: isRevenue ? 'REVENUE' : categories[i % categories.length],
        description: isRevenue ? 'Fleet Service Payment' : 'Operational Expense',
        date: date,
        organizationId: org.id,
      },
    });
  }

  console.log('✅ Financial Ledger Populated');
  console.log('🍀 Seeding Complete. Welcome to Lazy Logistics.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
