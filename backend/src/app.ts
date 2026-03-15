import express from 'express';
import { Routes } from './interfaces/routes.interface';

export class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
    }

    private initializeRoutes(routes: Routes[]) {
        this.app.get('/', (req, res) => {
            res.json({ message: 'Welcome to the FleetOS API with OOP Architecture' });
        });

        routes.forEach(route => {
            this.app.use('/api', route.router);
        });
    }
}
