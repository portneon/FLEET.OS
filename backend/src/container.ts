import { Server } from 'node:http';
import { App } from './app';
import { Database } from './database/Database';
import { DriverService } from './modules/staff/application/DriverService';
import { DriverRepository } from './modules/staff/repositories/DriverRepository';

export class BackendContainer {
    readonly database: Database;
    readonly driverRepository: DriverRepository;
    readonly driverService: DriverService;
    readonly app: App;

    constructor() {
        this.database = new Database();
        this.driverRepository = new DriverRepository(this.database);
        this.driverService = new DriverService(this.driverRepository);
        // Staff routes stay unmounted until a verified auth context is available.
        this.app = new App();
    }

    start(): Server {
        return this.app.listen();
    }
}
